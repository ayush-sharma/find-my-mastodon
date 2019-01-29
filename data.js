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

 		return null;
 	}

 	var data_table = $('#data_table').DataTable();

 	responseData.instances.forEach(function(element) {

 		data_table.row.add(renderRow(element)).draw(false);
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
 function fetchData(languages, allow_adult_content, min_users, max_users, min_active_users, include_dead, include_down, include_closed, next_page_id)
 {
 	var request = new XMLHttpRequest();

 	var url = 'https://instances.social/api/1.0/instances/list';
 	var token = 'D8w36TkQckJ0k6Ts8NXazrlzYnhxCwbN3nLbV50f5WDLAEKiGZSSnLGzS7MxjvEOzLXC3QS1rxVtooSFlNhiTHoj18pPvltxcbrkr36eWAJY5Su8sCdgePcRTbY3iOZA';	

 	var params = 'min_users=' + min_users
 				 + '&max_users=' + max_users
 				 + '&min_active_users=' + min_active_users
 				 + '&include_dead=' + include_dead
 				 + '&include_down=' + include_down
 				 + '&include_closed=' + include_closed
 				 + '&sort_by=users&sort_order=desc';

 	if(next_page_id !== null) {

 		params += '&min_id=' + next_page_id;
 	}

 	request.open('GET', url + '?' + params, true);
 	request.setRequestHeader('Authorization', 'Bearer ' + token);
 	request.send();
 	request.onreadystatechange= function () {

 		if (request.readyState == 4 && request.status == 200) {

 			var responseData = request.responseText;
 			responseData = JSON.parse(responseData);

 			console.log(url);
 			console.log(responseData);

 			response = processResponse(responseData);

 			if (response != null) {

 				next_page_id = responseData.pagination != undefined && responseData.pagination.next_id != undefined && responseData.pagination.next_id.length > 0 ? responseData.pagination.next_id : null;

	 			if(next_page_id !== null) {

	 				fetchData(languages, allow_adult_content, min_users, max_users, min_active_users, include_dead, include_down, include_closed, next_page_id);	
	 			}
 			}
 		}
 	}
 }

 function renderRow(element)
 {
 	var instance_name = element.name;
 	var instance_url = '<a href="https://' + instance_name + '" target="_blank">' + instance_name + '</a>';
 	var instance_desc = element.info != undefined && element.info.short_description != undefined ? element.info.short_description : null;
 	var thumbnail = element.thumbnail != undefined && element.thumbnail.length > 0 ? element.thumbnail : null;

 	users = parseFloat(element.users).toLocaleString('en');
 	statuses = parseFloat(element.statuses).toLocaleString('en');

 	var https_rank = element.https_rank != undefined ? (element.https_rank).trim() : ( element.obs_rank != undefined ? element.obs_rank : '-' );

 	var badge_class = null;
 	if(['A', 'A+', 'A-'].indexOf(https_rank) >= 0) {

 		badge_class = 'success';
 	}
 	else if(['B', 'B+', 'B-'].indexOf(https_rank) >= 0) {

 		badge_class = 'warning';
 	}
 	else {

 		badge_class = 'danger';
 	}

 	secure_badge = '<span class="badge badge-' + badge_class + '">Security: ' + https_rank + '</span>';

 	if(element.up == false) {

 		status_badge = '<span class="badge badge-danger">Down :(</span>';
 	}
 	else if(element.open_registrations == false) {

 		status_badge = '<span class="badge badge-warning">Closed</span>';	
 	}
 	else if(element.up == true) {

 		status_badge = '<span class="badge badge-success">Up :)</span>';
 	}

 	return [

 	(thumbnail != null ? '<img class="float-left mr-2 rounded" src="' + thumbnail + '" width="35" height="35" alt="' + instance_name + '" /></div>' : '') + instance_url + ( instance_desc != null ? '<div class="small text-muted">' + instance_desc + '</div>' : ''),
 	status_badge + '<br />' + secure_badge,
 	users,
 	statuses
 	];
 }

/**
 * Main function.
 *
 * @return void
 */
 $(document).ready(function () {

 	var languages = $.urlParam('languages%5B%5D');
 	var allow_adult_content = $.urlParam('adult_content');

 	min_users = $.urlParam('min_users') !== null ? $.urlParam('min_users') : '0';
 	max_users = $.urlParam('max_users') !== null ? $.urlParam('max_users') : '10000000';
 	min_active_users = $.urlParam('min_active_users') !== null ? $.urlParam('min_active_users') : '0';

 	include_dead = $.urlParam('include_dead') !== null ? $.urlParam('include_dead') : 'false';
 	include_down = $.urlParam('include_down') !== null ? $.urlParam('include_down') : 'false';
 	include_closed = $.urlParam('include_closed') !== null ? $.urlParam('include_closed') : 'false';

 	allow_adult_content = allow_adult_content != undefined && allow_adult_content == 1 ? true : false;

 	var data_table = $('#data_table').DataTable({
 		order: [[2, "desc"]],
 		columns: [
 		{ title: "Instance", width:"70%" },
 		{ title: "Status", width:"10%" },
 		{ title: "Users", width:"10%" },
 		{ title: "Statuses", width:"10%" }
 		]
 	});

 	fetchData(languages, allow_adult_content, min_users, max_users, min_active_users, include_dead, include_down, include_closed, '');
 	
 	// min_users 0-
 	// max_users 0-
 	// min_active_users 0-

 });

