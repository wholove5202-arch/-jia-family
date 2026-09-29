
import {confirm,object as objectDeath,startDeathConfirmation} from "./deathLegacyWorkflow";
import {migrateState,validateState} from "./stateMigration";

export function runDomainSelfTest(){
 const c=startDeathConfirmation("p1","p2");
 const c1=confirm(c,"p3");
 const c2=confirm(c1,"p4");
 if(c2.status!=="confirmed") throw new Error("death confirmation threshold failed");
 const d=objectDeath(startDeathConfirmation("p1","p2"),"p3");
 if(d.status!=="disputed") throw new Error("death objection failed");
 const s=migrateState({families:[{id:"f1"}],activeFamilyId:"f1"});
 if(!validateState(s).ok) throw new Error("state migration failed");
 return true;
}
