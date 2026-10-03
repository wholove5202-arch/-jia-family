"""Exercise the installed APK and retain UI evidence; never ignore an app ANR."""
import re
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path

PACKAGE = 'com.jia.familymemory.test'
OUT = Path('phone-evidence')


def adb(*args):
    return subprocess.check_output(['adb', *args], timeout=30)


def center(node):
    x1, y1, x2, y2 = map(int, re.findall(r'\d+', node.attrib['bounds']))
    return str((x1 + x2) // 2), str((y1 + y2) // 2)


def launcher_dialog(root):
    # Only this observed emulator-system failure may be dismissed.
    title = next((n.attrib.get('text', '') for n in root.iter('node')
                  if n.attrib.get('resource-id') == 'android:id/alertTitle'), '')
    if title != "Pixel Launcher isn't responding":
        return None
    return next((n for n in root.iter('node')
                 if n.attrib.get('resource-id') == 'android:id/aerr_close'), None)


def snapshot(name):
    adb('shell', 'uiautomator', 'dump', '/sdcard/jia-ui.xml')
    xml = adb('shell', 'cat', '/sdcard/jia-ui.xml')
    (OUT / f'{name}.xml').write_bytes(xml)
    (OUT / f'{name}.png').write_bytes(adb('exec-out', 'screencap', '-p'))
    return ET.fromstring(xml)


def wait_for(label, name, scroll=False, checkable=False):
    deadline = time.monotonic() + 90
    swipes = 0
    while time.monotonic() < deadline:
        root = snapshot(name)
        dialog = launcher_dialog(root)
        if dialog is not None:
            (OUT / 'system-dialog.xml').write_bytes(ET.tostring(root))
            adb('shell', 'input', 'tap', *center(dialog))
            adb('shell', 'am', 'start', '-W', '-n', PACKAGE + '/.MainActivity')
        else:
            node = next((n for n in root.iter('node')
                         if n.attrib.get('package') == PACKAGE
                         and (not checkable or n.attrib.get('checkable') == 'true')
                         and label in (n.attrib.get('text', '') + n.attrib.get('content-desc', ''))), None)
            if node is not None:
                return node
            if scroll and swipes < 6 and any(n.attrib.get('package') == PACKAGE for n in root.iter('node')):
                width, height = map(int, re.findall(r'(\d+)x(\d+)', adb('shell', 'wm', 'size').decode())[-1])
                adb('shell', 'input', 'swipe', str(width // 2), str(height * 3 // 4), str(width // 2), str(height // 3), '500')
                swipes += 1
        time.sleep(2)
    raise AssertionError(f'{name}: missing app UI {label!r}; see screenshot and XML')


def tap(label, name, scroll=False):
    node = wait_for(label, name, scroll)
    adb('shell', 'input', 'tap', *center(node))


def main():
    OUT.mkdir(exist_ok=True)
    try:
        tap('开始使用', '01-welcome')
        tap('先看看已有的家庭', '02-family-entry')
        wait_for('打开小家浮动窗口', '03-home')
        home = snapshot('03-home')
        robot = next(n for n in home.iter('node') if n.attrib.get('content-desc') == '打开小家浮动窗口')
        tab = next(n for n in home.iter('node') if n.attrib.get('content-desc') == '我的')
        robot_bottom = list(map(int, re.findall(r'\d+', robot.attrib['bounds'])))[3]
        tab_top = list(map(int, re.findall(r'\d+', tab.attrib['bounds'])))[1]
        assert robot_bottom <= tab_top, 'Home robot covers bottom navigation'
        tap('家族树', '03-home')
        wait_for('亲戚怎么称呼', '04-tree', scroll=True)
        tap('设置家庭分支可见范围', '04-tree', scroll=True)
        switch = wait_for('允许关联家庭查看', '05-branch-settings', checkable=True)
        assert switch.attrib.get('checked') == 'true', 'Branch preference must default on'
        adb('shell', 'input', 'tap', *center(switch))
        tap('保存家庭分支设置', '05-branch-off')
        wait_for('已保存', '05-branch-saved')
        adb('shell', 'am', 'force-stop', PACKAGE)
        adb('shell', 'am', 'start', '-W', '-n', PACKAGE + '/.MainActivity')
        tap('开始使用', '06-relaunch')
        tap('先看看已有的家庭', '07-family-entry')
        tap('家族树', '08-home')
        tap('设置家庭分支可见范围', '09-tree', scroll=True)
        switch = wait_for('允许关联家庭查看', '10-persisted-branch', checkable=True)
        assert switch.attrib.get('checked') == 'false', 'Closed branch preference lost after restart'
        tap('家讯', '11-open-chat')
        message = 'APP-SMOKE-' + str(int(time.time()))
        tap('家庭群消息', '12-chat-input')
        adb('shell', 'input', 'text', message)
        tap('发送群消息', '13-chat-keyboard-send')
        wait_for(message, '14-chat-sent')
        adb('shell', 'input', 'keyevent', 'KEYCODE_BACK')
        root = snapshot('14-chat-keyboard-closed')
        assert sum(n.attrib.get('text') == message for n in root.iter('node')) == 1, 'Sent chat message duplicated'
        assert not any(n.attrib.get('content-desc') == '打开小家浮动窗口' for n in root.iter('node')), 'Robot overlay appears in family group'
        tap('添加聊天照片或视频', '15-chat-attachments')
        for label in ['选择聊天照片', '拍摄', '语音通话', '位置', '红包', '礼物', '转账', '语音输入']:
            wait_for(label, '15-chat-attachments')
        tap('转账', '16-chat-unavailable')
        wait_for('转账暂未开放', '16-chat-unavailable')
        tap('关闭功能提示', '16-chat-close-notice')
        tap('查看群成员', '17-chat-info')
        tap('备注', '18-chat-remark')
        tap('备注输入', '18-chat-remark-input')
        adb('shell', 'input', 'text', 'APP-SMOKE-NOTE')
        adb('shell', 'input', 'keyevent', 'KEYCODE_BACK')
        tap('保存群设置', '19-chat-remark-save')
        wait_for('APP-SMOKE-NOTE', '20-chat-remark-saved')
        adb('shell', 'am', 'force-stop', PACKAGE)
        adb('shell', 'am', 'start', '-W', '-n', PACKAGE + '/.MainActivity')
        tap('开始使用', '21-chat-relaunch')
        tap('先看看已有的家庭', '22-chat-family-entry')
        tap('家讯', '23-chat-restored')
        wait_for(message, '24-chat-message-persisted')
        tap('查看群成员', '25-chat-info-restored')
        wait_for('APP-SMOKE-NOTE', '26-chat-remark-persisted')
        (OUT / 'chat-test-message.txt').write_text(message)
        assert adb('shell', 'pidof', PACKAGE).strip(), 'App process missing'
        print('PASS installed APK: robot avoids navigation; branch, sent chat message and group remark survive relaunch; keyboard send, attachments and closed feature notice verified')
    finally:
        logs = adb('logcat', '-d')
        (OUT / 'startup.log').write_bytes(logs)
        # Scope failures to the app's current process; system-process failures
        # remain in the full evidence log for diagnosis.
        pid = adb('shell', 'pidof', PACKAGE).decode().strip().split()
        app_logs = '\n'.join(line for line in logs.decode(errors='replace').splitlines()
                             if any(re.search(r'\s' + p + r'\s', line) for p in pid))
        for failure in ['FATAL EXCEPTION', 'Unable to load script', 'JavascriptException']:
            assert failure not in app_logs, failure


if __name__ == '__main__':
    main()
