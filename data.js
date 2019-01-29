/**
 * Process response data and genereate HTML for DataTable row.
 * @param  {[type]} responseData [description]
 * @return {[type]}              [description]
 */
 function processResponse(responseData)
 {
 	if(responseData === null || responseData.instances.length == 0) {

 		return false;
 	}

 	var data_table = $('#data_table').DataTable();

 	responseData.instances.forEach(function(element) {

 		data_table.row.add(renderRow(element)).draw(false);
 	});

 	return true;
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
 function fetchData(params, next_page_id)
 {
 	var request = new XMLHttpRequest();

 	var url = 'https://instances.social/api/1.0/instances/list';
 	var token = 'D8w36TkQckJ0k6Ts8NXazrlzYnhxCwbN3nLbV50f5WDLAEKiGZSSnLGzS7MxjvEOzLXC3QS1rxVtooSFlNhiTHoj18pPvltxcbrkr36eWAJY5Su8sCdgePcRTbY3iOZA';	

 	var api_params = 'count=100'
 				 + '&min_users=' + params['min_users']
 				 + '&max_users=' + params['max_users']
 				 + '&min_active_users=' + params['min_active_users']
 				 + '&include_dead=false&include_down=false&include_closed=false'
 				 + '&sort_by=users&sort_order=desc';

 	for(var i in params['instance_status']) {

 		api_params += '&' + params['instance_status'][i] + '=true';
 	}

 	for(var i in params['prohibited_content']) {

 		api_params +='&prohibited_content[]=' + params['prohibited_content'][i];
 	}

 	if(next_page_id !== null) {

 		api_params += '&min_id=' + next_page_id;
 	}

 	request.open('GET', url + '?' + api_params, true);
 	request.setRequestHeader('Authorization', 'Bearer ' + token);
 	request.send();
 	request.onreadystatechange= function () {

 		if (request.readyState == 4 && request.status == 200) {

 			var responseData = request.responseText;
 			responseData = JSON.parse(responseData);

 			console.log(url);
 			console.log(responseData);

 			response = processResponse(responseData);

 			if (response) {

 				next_page_id = responseData.pagination != undefined && responseData.pagination.next_id != undefined && responseData.pagination.next_id.length > 0 ? responseData.pagination.next_id : null;

	 			if(next_page_id !== null) {

	 				fetchData(params, next_page_id);	
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

 	return [

 	(thumbnail != null ? '<img class="float-left mr-2 rounded" src="' + thumbnail + '" width="35" height="35" alt="' + instance_name + '" /></div>' : '') + instance_url + ( instance_desc != null ? '<div class="small text-muted">' + instance_desc + '</div>' : ''),
 	secure_badge,
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

 	params = {
 		'min_users': $.urlParam('min_users') !== null ? $.urlParam('min_users') : '0',
 		'max_users': $.urlParam('max_users') !== null ? $.urlParam('max_users') : '10000000',
 		'min_active_users': $.urlParam('min_active_users') !== null ? $.urlParam('min_active_users') : '0',
 		'prohibited_content': ['nudity_nocw', 'nudity_all', 'pornography_nocw', 'pornography_all', 'illegalContentLinks', 'spam', 'advertising', 'spoilers_nocw'],
 		'filterSelect': function(keyName) {

 			$('#' + keyName + ' option[value="' + this[keyName] + '"]').attr('selected', 'selected');
 		},
 		'filterProps': function(keyName) {

 			found = [];

 			for(var i in this[keyName]) {

 				if($.urlParam(this[keyName][i]) == 'true') {

 					found.push(this[keyName][i]);
 				}
 			}

 			this[keyName] = found;
 		},
 		'activateSwitches': function(keyName) {

 			for(var i in this[keyName]) {

 				$('#' + this[keyName][i]).attr('checked', true);
 			}
 		},
 	};

 	// Validate switches
 	params.filterSelect('min_users');
 	params.filterSelect('max_users');
 	params.filterSelect('min_active_users');
    params.filterProps('prohibited_content');
    params.activateSwitches('prohibited_content');

 	var data_table = $('#data_table').DataTable({
 		order: [[2, "desc"]],
 		columns: [
 		{ title: "Instance", width:"70%" },
 		{ title: "Info", width:"10%" },
 		{ title: "Users", width:"10%" },
 		{ title: "Statuses", width:"10%" }
 		]
 	});

 	fetchData(params, '');
 });

