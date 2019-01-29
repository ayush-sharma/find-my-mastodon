/**
 * Fetch values from URL parameters by paramter name.
 * 
 * @param  strring name Name of paramter.
 * @return string
 */
 $.urlParam = function(name){

 	var vars = [], hash;
 	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
 	
 	for(var i = 0; i < hashes.length; i++)
 	{
 		hash = hashes[i].split('=');
 		vars.push(hash[0]);

 		if(vars[hash[0]] != undefined) {

 			var tmp = vars[hash[0]];

 			if(Array.isArray(vars[hash[0]])) {

 				vars[hash[0]].push(hash[1]);
 			}
 			else {

 				tmp = vars[hash[0]];

 				vars[hash[0]] = [tmp, hash[1]];
 			}
 		}
 		else {

 			vars[hash[0]] = hash[1];	
 		}
 	}

 	return vars[name] != undefined ? vars[name] : null;
 }