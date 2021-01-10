
function op(object) {

    if(object && typeof object == 'string' 
      && object!=null && object != undefined)
     return document.querySelector(object);

    return undefined;
}


pv = () =>{
       
  op("#rouge_type").options.selectedIndex==1 ||  op("#rouge_type").options.selectedIndex==2 ?
  op("#topic_type").disabled = false : op("#topic_type").disabled = true  ;
}

b = () =>{
  op("#stemmer_name").disabled==false ? 
  op("#stemmer_name").disabled = true : 
  op("#stemmer_name").disabled = false;                               

}

a = () => {

  event.preventDefault;

  let spinner = op('#loader');
  let modal = op('.modal');

  if(modal!= null && modal!=undefined 
    && spinner!=null 
    && spinner!=undefined){
   
     modal.style.display="flex";

    spinner.style.display = 'flex';
    spinner.style.top = '50px';
    spinner.classList.add('loader');    

    var timer = setTimeout(function(){
      spinner.classList.remove('loader');  
      modal.style.display="none";
      spinner.style.display = 'none';   
    },1500)     
  }
}

c = () => {

  event.preventDefault;

  let spinner = op('#loader');
  let modal = op('.modal');

  if(modal!= null && modal!=undefined 
    && spinner!=null 
    && spinner!=undefined){
   
     modal.style.display="flex";

    spinner.style.display = 'flex';
    spinner.style.top = '50px';
    spinner.classList.add('loader');    


   /* var timer = setTimeout(function(){
      spinner.classList.remove('loader');  
      modal.style.display="none";
      spinner.style.display = 'none';   
    },3500) */    
  }
}
 



/*

window.addEventListener('load', function () {
  let spinner = op('#loader');
  let modal = op('.modal');

 
  if(modal!= null && modal!=undefined   && spinner!=null 
    && spinner!=undefined){
   
     modal.style.display="flex";

    spinner.style.display = 'flex';
    spinner.style.top = '50px';
    spinner.classList.add('loader');    

    var timer = setTimeout(function(){

       spinner.classList.remove('loader');    
           
     modal.style.display="none";

    spinner.style.display = 'none';
   


    },1500)   
  }

  });*/