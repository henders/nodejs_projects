console.log('setting form override');
function loginPageInit() {
	$('#loginForm').submit(function(e) {
		var email = $('#email').val();
		console.log("logging in: " + email);

		$.post('/login', {email: email}, function(result) {
			console.log("Got login result: " + JSON.stringify(result));
			taskmaster.user = result.user;
			console.log('setting cookie');
			$.cookie('taskmaster', JSON.stringify(taskmaster));
			// now load addChorePage
			console.log('clicking home icon');
			$('#home_icon').click();
		}, "json");

		return false;
	});
};
