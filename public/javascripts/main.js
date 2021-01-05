
function op(object) {

    if(object && typeof object == 'string' 
      && object!=null && object != undefined)
     return document.querySelector(object);

    return undefined;
}

function disableForm(label, color){

    for(i=0;i<label.length;i++){                  
      label[i].style.color = color;
  }        
}

window.addEventListener('load', function(){        
  op("input[name='default_rouge'").checked = true;
  1!=null ? b() : null;
});

b = () =>{
  if(op("input[name='default_rouge'") && 
  op("input[name='default_rouge'").checked==false){
    op("#ngram").disabled =false;
    op("#beta").disabled =false;
    op("#stopwords_use").disabled =false;
    op("#synonyms_use").disabled =false;
    op("#stemmer_use").disabled =false;
    op("#rouge_type").disabled =false;
    op("#post_tagger").disabled =false;
    op("#stemmer_name").disabled =false;  
     const label = document.querySelectorAll(".label_form");  
     const color = "#2F3962";
     disableForm(label, color);
} else{
    op("#ngram").disabled =true;
    op("#beta").disabled =true;
    op("#stopwords_use").disabled =true;
    op("#synonyms_use").disabled =true;
    op("#stemmer_use").disabled =true;
    op("#rouge_type").disabled =true;
    op("#post_tagger").disabled =true;
    op("#stemmer_name").disabled =true;
     const label = document.querySelectorAll(".label_form");  
     const color = "gray";
     disableForm(label, color);       
}  
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
   

  }
}
 


/*
window.addEventListener('DOMContentLoaded', (event) => {  
 
    let s = event.target.forms;
    console.log(s[0].name);
    return (1===1) ?  a() : null;
    a();
    
});*/


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