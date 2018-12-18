if(typeof dwr == "undefined" || dwr.engine == undefined) {
	throw new Error("You must include DWR engine before including this file")
}(function() {
	if(dwr.engine._getObject("MsgChannel") == undefined) {
		var p;
		p = {};
		p.connect = function(p0, callback) {
			return dwr.engine._execute(p._path, "MsgChannel", "connect", arguments)
		};
		dwr.engine._setObject("MsgChannel", p)
	}
})();