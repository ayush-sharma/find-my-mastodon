/**
 * Get user selected input and call fetchData().
 * 
 * @return void
 */
 function updateData(languages, allow_adult_content, size, weekly_active_users) {

 	var request = new XMLHttpRequest();

 	var url = 'https://instances.social/api/1.0/instances/list';
 	var params = 'min_active_users=' + weekly_active_users + '&sort_by=users&sort_order=desc';
 	var token = 'D8w36TkQckJ0k6Ts8NXazrlzYnhxCwbN3nLbV50f5WDLAEKiGZSSnLGzS7MxjvEOzLXC3QS1rxVtooSFlNhiTHoj18pPvltxcbrkr36eWAJY5Su8sCdgePcRTbY3iOZA';

 	request.open('GET', url + '?' + params, true);
 	request.setRequestHeader('Authorization', 'Bearer ' + token);
 	request.send();
 	request.onreadystatechange= function () {
 		
 		if (request.readyState == 4) {

 			if(request.status != 200) {

 				return null;
 			}

 			responseData = request.responseText;
 			responseData = JSON.parse(responseData);

 			console.log(responseData);

 			processResponse(responseData);

 			var next_page_id = responseData.pagination != undefined && responseData.pagination.next_id != undefined && responseData.pagination.next_id.length > 0 ? responseData.pagination.next_id : null;

 			updateNextPageData(languages, allow_adult_content, size, weekly_active_users, next_page_id);
 		}
 	}
 }

/**
 * Process response data and genereate HTML for DataTable row.
 * @param  {[type]} responseData [description]
 * @return {[type]}              [description]
 */
 function processResponse(responseData)
 {
 	if(responseData === null) {

 		return false;
 	}

 	if(responseData.instances.length == 0) {

 		console.log('- No results.');

 		$('#data_table').DataTable().clear();

 		return null;
 	}

 	console.log('- ' + responseData.instances.length + ' instances found.');

 	var data_table = $('#data_table').DataTable();

 	responseData.instances.forEach(function(element) {

 		data_table.row.add(getRowHTML(element)).draw(false);
 	});
 }

/**
 * Update next page data.
 * 
 * @param  {[type]} languages           [description]
 * @param  {[type]} allow_adult_content [description]
 * @param  {[type]} size                [description]
 * @param  {[type]} weekly_active_users [description]
 * @param  {[type]} min_id              [description]
 * @return {[type]}                     [description]
 */
 function updateNextPageData(languages, allow_adult_content, size, weekly_active_users, next_page_id)
 {
 	if(next_page_id == null) {

 		return false;
 	}

 	console.log('Called for page:' + next_page_id);

 	var request = new XMLHttpRequest();

 	var url = 'https://instances.social/api/1.0/instances/list';
 	var params = 'min_active_users=' + weekly_active_users + '&sort_by=users&sort_order=desc';
 	var token = 'D8w36TkQckJ0k6Ts8NXazrlzYnhxCwbN3nLbV50f5WDLAEKiGZSSnLGzS7MxjvEOzLXC3QS1rxVtooSFlNhiTHoj18pPvltxcbrkr36eWAJY5Su8sCdgePcRTbY3iOZA';	

 	tmp_params = params + '&min_id=' + next_page_id;

 	request.open('GET', url + '?' + tmp_params, true);
 	request.setRequestHeader('Authorization', 'Bearer ' + token);
 	request.send();
 	request.onreadystatechange= function () {

 		if (request.readyState == 4 && request.status == 200) {

 			responseData = request.responseText;
 			responseData = JSON.parse(responseData);

 			console.log(responseData);

 			processResponse(responseData);

 			next_page_id = responseData.pagination != undefined && responseData.pagination.next_id != undefined && responseData.pagination.next_id.length > 0 ? responseData.pagination.next_id : null;

 			updateNextPageData(languages, allow_adult_content, size, weekly_active_users, next_page_id);
 		}
 	}
 }

 function getRowHTML(element)
 {
 	var instance_name = element.name;
 	var instance_desc = element.info != undefined && element.info.short_description != undefined ? element.info.short_description : null;
 	var thumbnail = element.thumbnail != undefined && element.thumbnail.length > 0 ? element.thumbnail : null;

 	if(instance_name == 'switter.at') {

 		console.log('Found switter');
 	}

 	var https_score = element.https_score != undefined ? element.https_score : ( element.obs_score != undefined ? element.obs_score : 0);
 	var https_rank = element.https_rank != undefined ? element.https_rank : ( element.obs_rank != undefined ? element.obs_rank : 'F');

 	var secure_badge = https_score > 90 ? 1 : ( https_score > 75 ? 0 : -1);
 	var secure_badge = secure_badge == 1 ? '<span class="badge badge-success">' + https_rank + '</span>' : ( secure_badge == 0 ? '<span class="badge badge-warning">' + https_rank + '</span>' : '<span class="badge badge-danger">' + https_rank + '</span>');

 	var status_badge = null;

 	if(element.up == false) {

 		status_badge = '<span class="badge badge-danger">Down</span>';
 	}
 	else if(element.open_registrations == false) {

 		status_badge = '<span class="badge badge-warning">Registration Closed</span>';	
 	}
 	else if(element.up == true) {

 		status_badge = '<span class="badge badge-success">OK</span>';
 	}

 	return [

 	(thumbnail != null ? '<img class="float-left mr-2 rounded" src="' + thumbnail + '" width="35" height="35" alt="' + instance_name + '" /></div>' : '') + instance_name + ( instance_desc != null ? '<div class="small text-muted">' + instance_desc + '</div>' : ''),
 	status_badge,
 	element.users,
 	element.statuses,
 	secure_badge

 	];	
 }

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

/**
 * Main function.
 *
 * @return void
 */
 $(document).ready(function () {

 	var user_counts = {
 		'0': null,
 		'1': 0,
 		'2': 100,
 		'3': 1000,
 		'4': 10000,
 		'5': 100000,
 		'6': 500000,
 		'7': 1000000
 	};

 	var languages = $.urlParam('languages%5B%5D');
 	var allow_adult_content = $.urlParam('adult_content');
 	var min_users = $.urlParam('size');
 	var weekly_active_users = $.urlParam('wau');

 	allow_adult_content = allow_adult_content != undefined && allow_adult_content == 1 ? true : false;

 	min_users = min_users != undefined && user_counts[min_users] != undefined ? user_counts[min_users] : 0;

 	weekly_active_users = weekly_active_users != undefined && user_counts[weekly_active_users] != undefined ? user_counts[weekly_active_users] : 0;

 	console.log('Languages:' + languages);
 	console.log('Adult?' + allow_adult_content);
 	console.log('Size:' + min_users);
 	console.log('WAU:' + weekly_active_users);

 	var data_table = $('#data_table').DataTable({
 		order: [[2, "desc"]],
 		columns: [
 		{ title: "Instance", width:"60%" },
 		{ title: "Status", width:"10%" },
 		{ title: "Users", width:"10%" },
 		{ title: "Statuses", width:"10%" },
 		{ title: "Security", width:"10%" }
 		]
 	});

 	updateData(languages, allow_adult_content, size, weekly_active_users);

 });

