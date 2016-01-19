export default (cssResources, jsResources) =>`
<html>
<head>
    <title>Code</title>
    ${cssResources.map(r =>'<link class="injected-style" rel="stylesheet" href="' + r + '">')}
</head>
<body>
<div id="client_results"></div>
<script src="/javascripts/react.js"></script>
<script src="/javascripts/reactdom.js"></script>
<div id="injected-scripts">${jsResources.map(r =>'<script type="text/javascript" src="' + r + '"></script>')}
</div>
</body>
</html>
`;