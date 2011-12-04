			var params = {
				username: taskmaster.user.email
			};
			var sig = createSignature('/chores/get', params);
			$.getJSON('/chores/get', {signature: sig, param: JSON.stringify(params)}, function(data) {
				if (data.error) {
					console.log('Encountered error: ' + data.error);
					showMsg(data.error);
				}
				else {
					// clear existing chores
					$('#choreList').text('');
					console.log('chores/get: ' + JSON.stringify(data));
					$.each(data.chores, function(i) {
						$('#choreList').append('<li><h3>' + data.chores[i].type.name + '</h3><p>' +
						data.chores[i].done_date + ' (' + data.chores[i].time_taken + ' minutes)' + '</p></li>'); });
					$('#choreList').listview('refresh');
					$('#chorePie').addClass('chorePie');
					// Draw the pie chart
					$.plot($("#chorePie"), data.chorePieData,
					{
						series: {
							pie: { 
								show: true,
								combine: {
									color: '#999',
									threshold: 0.1
								}
							}
						}
					});
				}
			});

