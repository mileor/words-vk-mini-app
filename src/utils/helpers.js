export function randomNumberFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function htmlToElement(string) {
  let template = document.createElement('template');
  string = string.trim();
  template.innerHTML = string;

  if (template.content.childNodes[2].nodeName === 'UL') {
    return template.content.childNodes[2];
  }

  return template.content.firstChild;
}

export function checkIsCity(string) {
  return string.includes("город") || 
         string.includes("село") || 
         string.includes("хутор") || 
         string.includes("посёлок") || 
         string.includes("ПГТ") || 
         string.includes("деревня");
}

export function getDynamicObjPropName(obj) {
  let newObj = obj.query.pages;
  let propName;

  for (let item in newObj) {
    propName = item;
  }
  
  return propName;
}