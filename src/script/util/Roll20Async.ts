// A Typescript port of https://github.com/onyxring/Roll20Async

declare var setInterval: (callback: TimerHandler, timeout?: number, ...args: any[]) => Timer;
declare var setTimeout: (callback: TimerHandler, timeout?: number, ...args: any[]) => Timer;

export function setActiveCharacterId(charId: string | null): string | null {
  const oldAcid=getActiveCharacterId();
  const ev = new CustomEvent("message");
  (ev as any).data={"id":"0", "type":"setActiveCharacter", "data":charId};
  self.dispatchEvent(ev);
  return oldAcid;
}
const _sIn=setInterval || self.setInterval;
(setInterval as any) = self.setInterval =function(callback: TimerHandler, timeout?: number, ...args: any[]): Timer {
  const acid=getActiveCharacterId();
  return _sIn(
    function(){
      const prevAcid=setActiveCharacterId(acid);
      callback();
      setActiveCharacterId(prevAcid);
    }
    ,timeout);
}
const _sto=setTimeout || self.setTimeout;
(setTimeout as any) = self.setTimeout =function(callback: TimerHandler, timeout?: number, ...args: any[]): Timer {
  const acid=getActiveCharacterId();
  return _sto(
    function(){
      const prevAcid=setActiveCharacterId(acid);
      callback();
      setActiveCharacterId(prevAcid);
    }
    ,timeout);
}
export function getAttrsAsync(props: string[]): Promise<ValuesResult> {
  const acid=getActiveCharacterId(); //save the current activeCharacterID in case it has changed when the promise runs
  let prevAcid: string | null = null;               //local variable defined here, because it needs to be shared across the promise callbacks defined below
  return new Promise<ValuesResult>((resolve,reject)=>{
    prevAcid=setActiveCharacterId(acid);  //in case the activeCharacterId has changed, restore it to what we were expecting and save the current value to restore later
    try{
      getAttrs(props,(values)=>{  resolve(values); });
    }
    catch{ reject(); }
  }).finally(()=>{
    setActiveCharacterId(prevAcid); //restore activeCharcterId to what it was when the promise first ran
  });
}
//use the same pattern for each of the following...
export function setAttrsAsync(propObj: {[attributeName: string]: string | number}, options?: { silent: boolean }): Promise<ValuesResult> {
  const acid=getActiveCharacterId();
  let prevAcid: string | null =null;
  return new Promise<ValuesResult>((resolve,reject)=>{
    prevAcid=setActiveCharacterId(acid);
    try{
      setAttrs(propObj,options,(values)=>{ resolve(values); });
    }
    catch{ reject(); }
  }).finally(()=>{
    setActiveCharacterId(prevAcid);
  });
}

export function getSectionIDsAsync(sectionName: string): Promise<string[]>{
  const acid=getActiveCharacterId();
  let prevAcid: string | null =null;
  return new Promise<string[]>((resolve,reject)=>{
    prevAcid=setActiveCharacterId(acid);
    try{
      getSectionIDs(sectionName,(values)=>{ resolve(values); });
    }
    catch{ reject(); }
  }).finally(()=>{
    setActiveCharacterId(prevAcid);
  });
}
export function getSingleAttrAsync(prop: string): Promise<string> {
  const acid=getActiveCharacterId();
  let prevAcid: string | null=null;
  return new Promise<string>((resolve,reject)=>{
    prevAcid=setActiveCharacterId(acid);
    try{
      getAttrs([prop],(values)=>{  resolve(values[prop]); });
    }
    catch{ reject(); }
  }).finally(()=>{
    setActiveCharacterId(prevAcid);
  });
}
