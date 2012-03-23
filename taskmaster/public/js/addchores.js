
function addChorePageInit() {
    $('#createTaskForm').submit(function(e) {
        var params = {};
        params.choreType = $('#choreName').val();
        params.user = $('#personName').val();
        params.time = $('#timeSlider').val();
        var sig = createSignature('/chores/do', params);

        console.log("submitting chore: " + JSON.stringify(params));
        $.post('/chores/do', {signature: sig, param: JSON.stringify(params)}, function(result) {
            console.log("Got do-chore result: " + JSON.stringify(result));
            $.cookie('taskmaster', JSON.stringify(taskmaster));
            // now load addChorePage
            $('#chores_icon').click();
        }, "json");

        return false;
    });

    // Delay executing the chore stuff until we login
    $( '#addChorePage' ).live( 'pageshow', function(event) {
        console.log('Entering page: addChorePage');

        function createLeaderBoard() {
            var leaderBoardData = [];
            var userIds = [taskmaster.user.id];
            $.each(taskmaster.friends, function(i) { userIds.push(taskmaster.friends[i].friend_user_id); });
            var drawleaderBoard = function() {
                $.plot($('#leaderboardDiv'), leaderBoardData, {
                    series: {
                        lines: {show: false},
                    bars: { 
                        show: true,
                    barWidth: 0.5,
                    horizontal: true
                    }
                    },
                    xaxis: { ticks: 0, min: 0},
                    yaxis: { ticks: 0, max: userIds.length },
                    //xaxis: { tickLength: 0},
                    legend: { position: "se"},
                    grid: {borderWidth: 0},
                });
            };

            // Want to reverse sort the array
            function sortLeaders(a, b) {
                return a.data[0][0] - b.data[0][0];
            }

            // Load dynamic data for graphs
            console.log('List of Users:' + JSON.stringify(userIds));
            $.each(userIds, function(i) {	
                var params = {
                    username: taskmaster.user.email
                };
                var sig = createSignature('/user/getUserPoints/' + userIds[i], params);
                console.log('requesting userpoints for: '+ userIds[i]);
                $.getJSON('/user/getUserPoints/' + userIds[i], {signature: sig, param: JSON.stringify(params)}, function(pointData) { 
                    if (pointData.error) {
                        showMsg(pointData.error);
                    }
                    else {
                        leaderBoardData.push({
                            label: pointData.name + '(' + pointData.points + ')',
                            data: [[pointData.points, 0]]
                        });
                        leaderBoardData.sort(sortLeaders);
                        // Fix vertical ordering as well
                        for (var i = 0; i < leaderBoardData.length; i++) {
                            leaderBoardData[i].data[0][1] = i + 0.3;
                        }
                        drawleaderBoard();
                    }	
                });
            });

            // Set the height of the leaderBoardData
            $('#leaderboardDiv').height(Math.min( userIds.length * 50, 200));
            $('#leaderboardDiv').width('80%');
        }

        var params = {
            username: taskmaster.user.email
        };			
        var sig = createSignature('/chores/types', params);
        $.getJSON('/chores/types', {signature: sig, param: JSON.stringify(params)}, function(data) {
            console.log('chores/types result: ' + JSON.stringify(data));
            if (data.error) {
                console.log('Encountered error: ' + data.error);
                showMsg(data.error);
            }
            else {
                var types = [];
                taskmaster.choreTypes = data;
                $.each(data, function(i) { types.push(data[i].name); });
                $('#choreName').autocomplete( { source: types } );
            }
        });

        var params = {
            username: taskmaster.user.email
        };			
        var sig = createSignature('/friends/list', params);
        $.getJSON('/friends/list', {signature: sig, param: JSON.stringify(params)}, function(data) {
            console.log('friends/list result: ' + JSON.stringify(data));
            if (data.error) {
                console.log('Encountered error: ' + data.error);
                showMsg(data.error);
            }
            else {
                taskmaster.friends = data;
                $.each(data, function(i) { 
                    $('#personName').append('<option value="' + data[i].id + '">' + data[i].name + '</option>');
                });
                $('#personOption').attr('value', taskmaster.user.id);
                createLeaderBoard();
            }
        });
    });
}
