var StringUtils = new function() {
	
	var startsWith = function (str, patt) {
		return str.slice(0, patt.length) == patt;
	};
	
	var replacements = [];
	replacements[0x00] = "[NUL]";
	replacements[0x01] = "[SOH]";
	replacements[0x02] = "[STX]";
	replacements[0x03] = "[ETX]";
	replacements[0x04] = "[EOT]";
	replacements[0x05] = "[ENQ]";
	replacements[0x06] = "[ACK]";
	replacements[0x07] = "[BEL]";
	replacements[0x08] = "[BS]";
	replacements[0x09] = "[TAB]";
	replacements[0x0a] = "[LF]";
	replacements[0x0b] = "[VT]";
	replacements[0x0c] = "[FF]";
	replacements[0x0d] = "[CR]";
	replacements[0x0e] = "[SO]";
	replacements[0x0f] = "[SI]";
	replacements[0x10] = "[DLE]";
	replacements[0x11] = "[DC1]";
	replacements[0x12] = "[DC2]";
	replacements[0x13] = "[DC3]";
	replacements[0x14] = "[DC4]";
	replacements[0x15] = "[NACK]";
	replacements[0x16] = "[SYN]";
	replacements[0x17] = "[ETB]";
	replacements[0x18] = "[CAN]";
	replacements[0x19] = "[EM]";
	replacements[0x1a] = "[SUB]";
	replacements[0x1b] = "[ESC]";
	replacements[0x1c] = "[FS]";
	replacements[0x1d] = "[GS]";
	replacements[0x1e] = "[RS]";
	replacements[0x1f] = "[US]";
	for (var i = 0x20; i < 0x7f; i++) {
		replacements[i] = String.fromCharCode(i & 0xFF);
	}
	replacements[0x7f] = "[DEL]";
	for (var i = 128; i < 256; i++) {
		var hex = (i).toString(16);
		var paddedHex = ("00" + hex).substring(hex.length);
		replacements[i] = "[0x" + paddedHex + "]";
	}
	this.r = replacements;
	/**
	 * Construct an integer from an input string Supported Prefixes are "0x" (hexadecimal) and "0b" (binary), otherwise base 10
	 * (decimal) is assumed. Examples: 0x0A 0x1B 0b11001001 40 40 0b11001001 0x1F
	 **/
	this.string2int = function(input) {
		var radix = 10;

		if (startsWith(input,'0x')) {
			radix = 16;
			input = input.replace("0x", "");

		} else if (startsWith(input,'0b')) {
			radix = 2;
			input = input.replace("0b", "");
		}
		return parseInt(input, radix);
	};
	
	this.makePrintable = function(arr) {
		var res = '';
		for (var i=0; i<arr.length; i++) {
			res += replacements[arr[i].charCodeAt(0)];
		}
		return res;
	};
	
	var padl = function(str, pad, num) {
		return (Array(num+1).join(pad) + str).substring(str.length);
	};
	
	var toXstring = function(str, radix) {
		var res = [];
		for (var i=0; i< str.length; i++) {
			var num = (str.charCodeAt(i)).toString(radix);
			switch (radix) {
				case 16:
					num = padl(num,'0',2);
					break;
				case 2:
					num = padl(num,'0',8);
					break;
			}
			res.push(num);
		}
		return res.join(' ');
	};
	
	this.toHexString = function(str) {
		return toXstring(str, 16);
	};
	
	this.toDecimalString = function(str) {
		return toXstring(str, 10);
	};
	
	this.toBinaryString = function(str) {
		return toXstring(str, 2);
	};
	
};