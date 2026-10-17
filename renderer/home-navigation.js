'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.home-action[data-target]').forEach(button=>{
  button.addEventListener('click',()=>{
   const target=document.getElementById(button.dataset.target);
   if(!target)return;
   const parents=[];let parent=target;
   while(parent){if(parent.tagName==='DETAILS')parents.unshift(parent);parent=parent.parentElement;}
   parents.forEach(details=>{details.open=true;});
   target.scrollIntoView({behavior:'smooth',block:'start'});
   const focusId=button.dataset.focus;
   if(focusId){const focus=document.getElementById(focusId);if(focus)focus.focus({preventScroll:true});}
  });
 });
});
