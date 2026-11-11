/*!
 * https://github.com/umarwebdeveloper/jquery-css-skills-bar
 * Author: @umarwebdeveloper
 * Licensed under the MIT license
 */(function(n){n.fn.skillBars=function(i){var e=n.extend({from:0,to:!1,speed:1e3,interval:100,decimals:0,onUpdate:null,onComplete:null,classes:{skillBarBar:".skillbar-bar",skillBarPercent:".skill-bar-percent"}},i);return this.each(function(){var t=n(this),l=e.to!=0?e.to:parseInt(t.attr("data-percent"));l>100&&(l=100);var a=e.from,r=Math.ceil(e.speed/e.interval),o=(l-a)/r,s=0,c=setInterval(function(){a+=o,s++,n(t).find(e.classes.skillBarPercent).text(a.toFixed(e.decimals)+"%"),typeof e.onUpdate=="function"&&e.onUpdate.call(t,a),s>=r&&(clearInterval(c),a=l,typeof e.onComplete=="function"&&e.onComplete.call(t,a))},e.interval);t.find(e.classes.skillBarBar).animate({width:parseInt(t.attr("data-percent"))+"%"},e.speed)})}})(jQuery);
