var StringUtils = new function() {
	
	var startsWith = function (str, patt) {
		return str.slice(0, patt.length) == patt;
	};
	
	var replacements = [];
	for (var i = -128; i < 0; i++) {
		var hex = (128+i).toString(16);
		var paddedHex = ("00" + hex).substring(hex.length);
		replacements[128 + i] = "[0x" + paddedHex + "]";
	}
	replacements[128 + 0x00] = "[NUL]";
	replacements[128 + 0x01] = "[SOH]";
	replacements[128 + 0x02] = "[STX]";
	replacements[128 + 0x03] = "[ETX]";
	replacements[128 + 0x04] = "[EOT]";
	replacements[128 + 0x05] = "[ENQ]";
	replacements[128 + 0x06] = "[ACK]";
	replacements[128 + 0x07] = "[BEL]";
	replacements[128 + 0x08] = "[BS]";
	replacements[128 + 0x09] = "[TAB]";
	replacements[128 + 0x0a] = "[LF]";
	replacements[128 + 0x0b] = "[VT]";
	replacements[128 + 0x0c] = "[FF]";
	replacements[128 + 0x0d] = "[CR]";
	replacements[128 + 0x0e] = "[SO]";
	replacements[128 + 0x0f] = "[SI]";
	replacements[128 + 0x10] = "[DLE]";
	replacements[128 + 0x11] = "[DC1]";
	replacements[128 + 0x12] = "[DC2]";
	replacements[128 + 0x13] = "[DC3]";
	replacements[128 + 0x14] = "[DC4]";
	replacements[128 + 0x15] = "[NACK]";
	replacements[128 + 0x16] = "[SYN]";
	replacements[128 + 0x17] = "[ETB]";
	replacements[128 + 0x18] = "[CAN]";
	replacements[128 + 0x19] = "[EM]";
	replacements[128 + 0x1a] = "[SUB]";
	replacements[128 + 0x1b] = "[ESC]";
	replacements[128 + 0x1c] = "[FS]";
	replacements[128 + 0x1d] = "[GS]";
	replacements[128 + 0x1e] = "[RS]";
	replacements[128 + 0x1f] = "[US]";
	for (var i = 0x20; i < 0x7f; i++) {
		replacements[128 + i] = String.fromCharCode(i & 0xFF);
	}
	replacements[128 + 0x7f] = "[DEL]";
	
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
			res += replacements[128 + arr[i].charCodeAt(0)];
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