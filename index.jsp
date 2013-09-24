<%@ page import="de.uniluebeck.itm.tr.iwsn.portal.PortalServerConfig" %>
<%@ page import="de.uniluebeck.itm.tr.iwsn.portal.WiseGuiServiceConfig" %>
<!DOCTYPE html >
<html>
<head>

	<meta charset="utf-8">

	<title>WiseGui</title>

	<link rel="stylesheet" media="screen" href="css/bootstrap.min.css">
	<link rel="stylesheet" media="screen" href="css/wisegui.css">
	<link rel="stylesheet" media="screen" href="css/jquery-ui.1.8.17.css">
	<link rel="stylesheet" media="screen" href="css/timePicker-20110318.css">

	<script type="text/javascript" src="js/lib/base64-20110406.min.js"></script>

	<script type="text/javascript" src="js/lib/base64_encode.js"></script>
	<script type="text/javascript" src="js/lib/base64_decode.js"></script>

	<script type="text/javascript" src="js/lib/jquery-1.7.1.js"></script>
	<script type="text/javascript" src="js/lib/jquery.ba-bbq-1.2.1.min.js"></script>
	<script type="text/javascript" src="js/lib/jquery.cookie-1.0.0.js"></script>
	<script type="text/javascript" src="js/lib/jquery.tablesorter-2.0.5.min.js"></script>
	<script type="text/javascript" src="js/lib/jquery.dateformat-1.0.js"></script>
	<script type="text/javascript" src="js/lib/jquery.timePicker-20110318.js"></script>
	<script type="text/javascript" src="js/lib/jquery.ba-throttle-debounce.min.js"></script>

	<script type="text/javascript" src="js/lib/jquery-ui.min.1.8.17.js"></script>

	<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>

	<script type="text/javascript" src="js/lib/bootstrap.min.js"></script>

	<script type="text/javascript" src="js/lib/BlobBuilder-20110713.js"></script>
	<script type="text/javascript" src="js/lib/FileSaver-20110802.js"></script>

	<script type="text/javascript" src="js/lib/explode.js"></script>
	<script type="text/javascript" src="js/lib/implode.js"></script>

	<script type="text/javascript" src="js/lib/ace/ace-uncompressed.js"></script>
	<script type="text/javascript" src="js/lib/ace/theme-textmate.js"></script>
	<script type="text/javascript" src="js/lib/ace/mode-javascript.js"></script>

	<script type="text/javascript" src="js/lib/keydrag.js"></script>

	<script type="text/javascript">

		var wisebedWebSocketBaseUrl = '<%= getServletConfig().getInitParameter(WiseGuiServiceConfig.WISEGUI_WEBSOCKET_URI) %>';
		var wisebedBaseUrl = '<%= getServletConfig().getInitParameter(WiseGuiServiceConfig.WISEGUI_REST_API_BASE_URI) %>';

	</script>

	<script type="text/javascript" src="js/string-utils.js"></script>
	<script type="text/javascript" src="js/wiseml.js"></script>
	<script type="text/javascript" src="js/wisebed.js"></script>
	<script type="text/javascript" src="js/wisegui.js"></script>

</head>

<body>
<div id="WisebedContainer" class="container"></div>
</body>

</html>