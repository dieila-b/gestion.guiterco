
const numberToWords = (num: number): string => {
  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  
  if (num === 0) return 'zéro';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ones[num % 10] : '');
  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    let result = hundreds === 1 ? 'cent' : ones[hundreds] + ' cent';
    if (remainder !== 0) {
      result += ' ' + numberToWords(remainder);
    }
    return result;
  }
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    let result = thousands === 1 ? 'mille' : numberToWords(thousands) + ' mille';
    if (remainder !== 0) {
      result += ' ' + numberToWords(remainder);
    }
    return result;
  }
  if (num < 1000000000) {
    const millions = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    let result = millions === 1 ? 'un million' : numberToWords(millions) + ' millions';
    if (remainder !== 0) {
      result += ' ' + numberToWords(remainder);
    }
    return result;
  }
  
  return num.toString();
};

export { numberToWords };
