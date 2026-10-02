const uncertainty=[['unsure','不确定'],['skip','暂时不答']];
export const interviewQuestions=[
 {id:'childhood_place',version:1,topic:'童年',text:'你小时候主要在哪里长大？',options:[['village','乡村'],['town','小镇'],['city','城市'],['many','几个地方'],...uncertainty]},
 {id:'childhood_company',version:1,topic:'童年',text:'小时候陪伴你最多的是谁？',options:[['parents','父母'],['grandparents','祖辈'],['siblings','兄弟姐妹'],['others','其他亲人'],['alone','自己'],...uncertainty]},
 {id:'move_away',version:1,topic:'经历',text:'你曾离开家乡，去别的地方生活吗？',options:[['yes','是'],['no','不是'],...uncertainty]},
 {id:'family_meal',version:1,topic:'日常',text:'一家人一起吃饭，对你很重要吗？',options:[['yes','是'],['no','不是'],['depends','看情况'],...uncertainty]},
 {id:'care_expression',version:1,topic:'心意',text:'你更习惯怎样表达对家人的关心？',options:[['words','说出来'],['actions','用行动'],['company','陪在身边'],['listen','认真倾听'],['mixed','几种都有'],...uncertainty]},
 {id:'hard_times',version:1,topic:'想法',text:'遇到困难时，你通常更希望怎样？',options:[['alone','先自己想想'],['talk','找人聊聊'],['help','一起解决'],['depends','看情况'],...uncertainty]},
 {id:'memory_theme',version:1,topic:'回忆',text:'你最想先留下哪一段回忆？',options:[['childhood','童年'],['parents','父母长辈'],['love','相伴的人'],['children','孩子成长'],['work','奋斗经历'],...uncertainty]},
 {id:'film_tone',version:1,topic:'回忆',text:'你希望未来的回忆影片是什么感觉？',options:[['warm','温暖平静'],['happy','轻松欢快'],['honest','朴实真实'],['nostalgic','怀旧感动'],...uncertainty]}
];
export function updateInterview(state,{personId,questionId,optionId},now=new Date().toISOString()){
 if(personId!=='me')throw new Error('目前仅支持本人回答');
 const question=interviewQuestions.find(q=>q.id===questionId);
 if(!question||optionId!==null&&!question.options.some(([id])=>id===optionId))throw new Error('请选择有效选项');
 const interviews=state.lifeInterviews||{},old=interviews[personId]||{},answers={...old.answers};
 if(optionId===null)delete answers[questionId];
 else answers[questionId]={optionId,questionVersion:question.version,source:'self',answeredAt:now};
 return {...state,aiAllowed:false,lifeInterviews:{...interviews,[personId]:{...old,personId,answers,updatedAt:now}}};
}
