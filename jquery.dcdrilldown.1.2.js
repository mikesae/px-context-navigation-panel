/* globals jQuery */
/*
 * DC jQuery Drill Down Menu - jQuery drill down ipod menu
 * Copyright (c) 2011 Design Chemical
 *
 * Dual licensed under the MIT and GPL licenses:
 * 	http://www.opensource.org/licenses/mit-license.php
 * 	http://www.gnu.org/licenses/gpl.html
 *
 */

(function ($) {
	'use strict';
	//define the new for the plugin ans how to call it
	$.fn.dcDrilldown = function (options) {

		//set default options
		var defaults = {
			classWrapper: 'dd-wrapper',
			classMenu: 'dd-menu',
			classParent: 'dd-parent',
			classParentLink: 'dd-parent-a',
			classActive: 'active',
			classHeader: 'dd-header',
			eventType: 'click',
			hoverDelay: 300,
			speed: 'slow',
			saveState: false,
			showCount: true,
			classCount: 'dd-count',
			classIcon: 'dd-icon',
			linkType: 'backlink',
			resetText: 'All',
			headerTag: 'h3',
			defaultText: '',
			includeHdr: true
		};

		//call in the default options
		options = $.extend(defaults, options);

		//act upon the element that is passed into the design
		return this.each(function () {

			var $dcDrilldownObj = this;
			$($dcDrilldownObj).addClass(defaults.classMenu);
			var $wrapper = '<div class="' + defaults.classWrapper + '" />';
			$($dcDrilldownObj).wrap($wrapper);
			var $dcWrapper = $($dcDrilldownObj).parent();
			var objIndex = $($dcWrapper).index('.' + defaults.classWrapper);
			var idHeader = defaults.classHeader + '-' + objIndex;
			var idWrapper = defaults.classWrapper + '-' + objIndex;
			$($dcWrapper).attr('id', idWrapper);
			var $header = '<div id="' + idHeader + '" class="' + defaults.classHeader + '"></div>';

			setUpDrilldown();

			resetDrilldown($dcDrilldownObj, $dcWrapper);
			hookBackButtonClick();

			// which object(s) should be used to control drill
			//$('.drilldownitem > li, .drilldownitem > .btn.btn-navigate', $dcDrilldownObj).click(function (e) {
			$('.drilldownitem > .btn.btn-navigate', $dcDrilldownObj).click(function (e) {
				var $link = $(this).parent('.drilldownitem');
				var $activeLi = $link.parent('li').stop();

				// Drilldown action
				// has a ul
				if ($('> ul', $activeLi).length) {
					if ($($link).hasClass(defaults.classActive)) {
						$('ul div', $activeLi).removeClass(defaults.classActive);
						resetDrilldown($dcDrilldownObj, $dcWrapper);
					} else {
						actionDrillDown($activeLi, $dcWrapper, $dcDrilldownObj);
					}
				}

				// Prevent browsing to link if has child links
				if ($(this).next('ul').length > 0) {
					e.preventDefault();
				}
			});

			//$('.geCore__NavigationPanel__Footer__Set').click;

			function hookBackButtonClick() {
				$('.btn.btn-navigate-back').click(function (e) {
					if ($('div', this).hasClass('link-back')) {
						$('div.' + defaults.classActive + ':last', $dcDrilldownObj).removeClass(defaults.classActive);
					} else {
						// Get link index
						var linkIndex = parseInt($(this).index('#' + idHeader + ' div'));
						if (linkIndex === 0) {
							$('div', $dcDrilldownObj).removeClass(defaults.classActive);
						} else {
							// Select equivalent active link
							linkIndex = linkIndex - 1;
							$('div.' + defaults.classActive + ':gt(' + linkIndex + ')', $dcDrilldownObj).removeClass(defaults.classActive);
						}
					}
					resetDrilldown($dcDrilldownObj, $dcWrapper);
					e.preventDefault();
				});
			}

			// Set up accordion
			function setUpDrilldown() {

				//$('.wrap .demo-container').prepend('<div class="geCore__NavigationPanel__Footer"><button class="geCore__NavigationPanel__Footer__Cancel">Cancel</button><button class="geCore__NavigationPanel__Footer__Set">Set Context</button></div>');

				// html for the document icon button
				var backButton = '<button class="btn btn-navigate-back"><i class="fa fa-angle-left ' + defaults.classIcon + '"></i></button>';

				// html for the > button
				var arrowButton = '<button class="btn btn-navigate"><i class="fa fa-angle-right"></i></button>';

				// prepends the header before the drilldown
				$($dcDrilldownObj).before($header);

				// Get width of menu container & height of list item
				var totalWidth = $($dcDrilldownObj).outerWidth();
				totalWidth += 'px';
				var itemHeight = $('li', $dcDrilldownObj).outerHeight(true);
				var objUl = $('ul', $dcDrilldownObj);

				addMenuItemCounts($dcDrilldownObj);
				addMenuItemCounts(objUl);

				// Set sub menu width and offset
				$('li', $dcDrilldownObj).each(function () {
					$('ul', this).css({width: totalWidth, marginRight: '-' + totalWidth, marginTop: '0'});

					// if the item has children
					if ($('> ul', this).length) {
						// adds parent class
						$(this).addClass(defaults.classParent);
						// adds parent link class
						$('> div', this).addClass(defaults.classParentLink);
						// appends the > to the div
						$('> div', this).append(arrowButton);
					}
					$('> div', this).prepend(backButton);
				});

				// Add css class
				$('ul', $dcWrapper).each(function () {
					$('li:last', this).addClass('last');
				});
				$('> ul > li:last', $dcWrapper).addClass('last');
				if (defaults.linkType === 'link') {
					$(objUl).css('top', itemHeight + 'px');
				}

			}
		});

		function addMenuItemCounts(element) {
			var maxValue;
			$(element).each(function () {
				var val = parseInt($('> li', this).length);
				$(this).attr('rel', val);
				if (maxValue === undefined || maxValue < val) {
					maxValue = val;
				}
			});
			return maxValue;
		}

		function updateBackButton(atRoot) {
			var $header = $('.' + defaults.classHeader);
			var $backButton;
			if (defaults.linkType === 'backButton') {
				if (!$('button', $header).length) {
					$($header).append('<button class="btn dd-back-button" style="display:none"><i class="geip-icon-ico_lite-arrow-prev_sm"></i></button><span class="dd-header-span">Select your context</span>');
				}
			}
			$backButton = $('.' + defaults.classHeader + ' > .btn');

			// if we're at root level, set 'disabled' attribute
			$backButton.prop('disabled', atRoot === true);
			if(atRoot === true) {
				// hide parent arrow when at root
				$('.btn.btn-navigate-back').css("cursor", "default");
				$('.btn.btn-navigate-back').hide();
			}
			else {
				// show parent arrow when not at root
				$('.btn.btn-navigate-back').css("cursor", "pointer");
				$('.btn.btn-navigate-back').show();
			}
		}

		// Drill Down
		function actionDrillDown(element, wrapper, obj) {
			// Declare header
			var $header = $('.' + defaults.classHeader, wrapper);

			// Get new breadcrumb and header text
			var getNewBreadcrumb = $('h3', $header).html();
			var getNewHeaderText = $('> div', element).html();

			// Add new breadcrumb
			//if(defaults.linkType === 'breadcrumb'){
			//	if(!$('ul',$header).length){
			//		$($header).prepend('<ul></ul>');
			//	}
			//	if(getNewBreadcrumb === defaults.defaultText){
			//		$('ul',$header).append('<li><div class="first">'+defaults.resetText+'</div></li>');
			//	} else {
			//		$('ul',$header).append('<li><div>'+getNewBreadcrumb+'</div></li>');
			//	}
			//}
			if (defaults.linkType === 'backlink') {
				if (!$('div', $header).length) {
					$($header).prepend('<div class="link-back">' + getNewBreadcrumb + '</div>');
				} else {
					$('.link-back', $header).html(getNewBreadcrumb);
				}
			}
			//if(defaults.linkType === 'link'){
			//	if(!$('div',$header).length){
			//		$($header).prepend('<ul><li><div class="first">'+defaults.resetText+'</div></li></ul>');
			//	}
			//}

			// Update header text
			updateHeader($header, getNewHeaderText);

			// declare child link
			//var activeLink = $('> a',element);
			var activeLink = $('> div', element);

			// add active class to link
			$(activeLink).addClass(defaults.classActive);
			$('> ul li', element).show();
			$('> ul', element).show();
			$('> ul', element).animate({"margin-left": 0}, defaults.speed);

			// Find all sibling items & hide
			var $siblingsLi = $(element).siblings();
			$($siblingsLi).hide();

			// If using breadcrumbs hide this element
			if (defaults.linkType !== 'link') {
				$(activeLink).hide();
			}
		}

		function updateHeader(obj, html) {
			var atRoot = html === defaults.defaultText;
			if (defaults.includeHdr === true) {
				if ($('h3', obj).length) {
					$('h3', obj).html(html);
				} else {
					$(obj).append('<' + defaults.headerTag + '>' + html + '</' + defaults.headerTag + '>');
				}
			}
			updateBackButton(atRoot);
		}

		// Reset accordion using active links
		function resetDrilldown(obj, wrapper) {
			var $header = $('.' + defaults.classHeader, wrapper);
			$('ul', $header).remove();
			$('div', $header).remove();
			$('li', obj).show();
			$('div', obj).show();
			var totalWidth = $(obj).outerWidth(true);
			if (defaults.linkType === "link") {
				if ($('div.' + defaults.classActive + ':last', obj).parent('li').length) {
					var lastActive = $('div.' + defaults.classActive + ':last', obj).parent('li');
					$('ul', lastActive).css('margin-left', totalWidth + 'px');
					$('ul', lastActive).hide();

				} else {
					$('ul', obj).css('margin-left', totalWidth + 'px');
					$('ul', obj).hide();
				}
			} else {
				$('ul', obj).css('margin-left', totalWidth + 'px');
				$('ul', obj).hide();
			}
			updateHeader($header, defaults.defaultText);

			$('div.' + defaults.classActive, obj).each(function () {
				var $activeLi = $(this).parent('li').stop();
				actionDrillDown($activeLi, wrapper, obj);
			});
		}
	};
})(jQuery);
