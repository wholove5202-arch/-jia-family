// Catch duplicate answers, another person's inferred answers, invalid options,
// or accidental inclusion of private diaries in the interview record.
const assert=require('node:assert/strict'),fs=require('fs');
(async()=>{
 const mod=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync('src/lifeInterview.js')).toString('base64'));
 const original={aiAllowed:false,privateNotes:[{text:'秘密'}],lifeInterviews:{}};
 const first=mod.updateInterview(original,{personId:'me',questionId:'childhood_place',optionId:'village'},'2026-10-02T13:00:00Z');
 assert.equal(first.lifeInterviews.me?.answers?.childhood_place?.optionId,'village','the chosen option must be saved');
 assert.deepEqual(original.lifeInterviews,{},'do not mutate existing state');
 const changed=mod.updateInterview(first,{personId:'me',questionId:'childhood_place',optionId:'city'},'2026-10-02T13:01:00Z');
 assert.equal(Object.keys(changed.lifeInterviews.me.answers).length,1);
 assert.equal(changed.lifeInterviews.me.answers.childhood_place.optionId,'city');
 assert.equal(changed.lifeInterviews.me.answers.childhood_place.source,'self');
 assert.equal(changed.lifeInterviews.me.answers.childhood_place.questionVersion,1);
 assert.equal(changed.aiAllowed,false);
 assert.deepEqual(changed.privateNotes,[{text:'秘密'}]);
 assert.equal(changed.lifeInterviews.me.privateNotes,undefined);
 assert.throws(()=>mod.updateInterview(first,{personId:'dad',questionId:'childhood_place',optionId:'city'}));
 assert.throws(()=>mod.updateInterview(first,{personId:'me',questionId:'childhood_place',optionId:'invalid'}));
 const removed=mod.updateInterview(changed,{personId:'me',questionId:'childhood_place',optionId:null});
 assert.equal(Object.keys(removed.lifeInterviews.me.answers).length,0);
 const skipped=mod.updateInterview(first,{personId:'me',questionId:'childhood_place',optionId:'skip'});
 assert.equal(skipped.lifeInterviews.me.answers.childhood_place.optionId,'skip');
 console.log('PASS self-only interview, corrections, deletion, skip, versioned provenance and private isolation');
})().catch(e=>{console.error(e);process.exitCode=1});
