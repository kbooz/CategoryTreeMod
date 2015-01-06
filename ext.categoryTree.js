/**
 * JavaScript for the CategoryTree extension.
 *
 * @file
 * @ingroup Extensions
 * @author Daniel Kinzler, brightbyte.de
 * @copyright © 2006 Daniel Kinzler
 * @licence GNU General Public Licence 2.0 or later
 */
( function ( $, mw ) {

	const ckey = 'ct-';
	const expand = 'expand'; // expand text in l18n
	const scroll = true;

	function setLast(){ // Set the last clicked label to localStorage
		$('.CategoryTreeLabel').click(function(e){
			localStorage.setItem('last',$(this).text());
			return true;
		});
	}
	setLast();


	var categoryTree = {

		/** 
		 * Set the category tree to localStorage if state is true, else delete it
		 * @param cat Category name
		 * @param state true if expanded, false if collapsed
		 */
		 setStorage: function (cat, state) {
		 	if(state)
		 		localStorage.setItem(ckey+cat,state);
		 	else
		 		localStorage.removeItem(ckey+cat);
		 },


		/** 
		 * Check if any previous label was clicked, if so, add the class CategoryTreeLabelLast to it,
		 * and clean it from localStorage
		 */
	 	checkLast: function(){
	 		var lastCat = localStorage.getItem('last');
	 		console.log(lastCat);
			if(lastCat) //check if is not undefined
			{
				var found = $("a.CategoryTreeLabel").filter(function(){ return $(this).text() == lastCat;}).addClass("CategoryTreeLabelLast"); //returns finded selectors
				// Check if the job was done
				if(found.length>0)
				{
					delete localStorage.last;
					if(scroll)
					{
						var topo=found.offset().top;
						$("div#mw-panel").animate({scrollTop: topo-50}, 10);
					}
				}
			}
		},

		/**
		 * Sets display inline to tree toggle
		 */
		showToggles: function () {
			$( 'span.CategoryTreeToggle' ).css( 'display', 'inline' );

			var toggles = $( 'span.CategoryTreeToggle' );
			var clicked=0
			for ( var i = 0; i < toggles.length; ++i ) {
				var s = $( toggles[i] ).attr('data-ct-title');
				var state = localStorage.getItem(ckey+s);

				var title = $( toggles[i] ).attr('title');
				if ( ( state == 'true' ) && ( title == expand ) ){
					$( toggles[i] ).click();
					clicked++;
				}
			}
			categoryTree.checkLast();
		},

		/**
		 * Handles clicks on the expand buttons, and calls the appropriate function
		 *
		 * @context {Element} CategoryTreeToggle
		 * @param e {jQuery.Event}
		 */
		handleNode: function ( e ) {
			var $link = $( this );
			if ( $link.data( 'ct-state' ) === 'collapsed' ) {
				categoryTree.expandNode( $link );
			} else {
				categoryTree.collapseNode( $link );
			}


		},

		/**
		 * Expands a given node (loading it's children if not loaded)
		 *
		 * @param {jQuery} $link
		 */
		expandNode: function ( $link ) {
			var $children = $link.parents( '.CategoryTreeItem' )
			.siblings( '.CategoryTreeChildren' );
			$children.show();

			$link
			.html( mw.msg( 'categorytree-collapse-bullet' ) )
			.attr( 'title', mw.msg( 'categorytree-collapse' ) )
			.data( 'ct-state', 'expanded' );

			if ( !$link.data( 'ct-loaded' ) ) {
				categoryTree.loadChildren( $link, $children );
			}

			categoryTree.setStorage( $link.data( 'ct-title' ), true );

		},

		/**
		 * Collapses a node
		 *
		 * @param {jQuery} $link
		 */
		collapseNode: function ( $link ) {
			$link.parents( '.CategoryTreeItem' )
			.siblings( '.CategoryTreeChildren' ).hide();

			$link
			.text( mw.msg( 'categorytree-expand-bullet' ) )
			.attr( 'title', mw.msg( 'categorytree-expand' ) )
			.data( 'ct-state', 'collapsed' );

			categoryTree.setStorage( $link.data( 'ct-title' ), false );
		},

		/**
		 * Loads children for a node via an HTTP call
		 *
		 * @param {jQuery} $link
		 * @param {jQuery} $children
		 */
		loadChildren: function ( $link, $children ) {
			var $linkParentCTTag, ctTitle, ctMode, ctOptions;

			/**
			 * Error callback
			 */
			function error() {
				var $retryLink;

				$retryLink = $( '<a>' )
				.text( mw.msg( 'categorytree-retry' ) )
				.attr( 'href', '#' )
				.click( function ( e ) {
					e.preventDefault();
					categoryTree.loadChildren( $link, $children );
				} );

				$children
				.text( mw.msg( 'categorytree-error' ) + ' ' )
				.append( $retryLink );
			}

			$link.data( 'ct-loaded', true );

			$children.append(
			                 $( '<i class="CategoryTreeNotice"></i>' )
			                 .text( mw.msg( 'categorytree-loading' ) )
			                 );

			$linkParentCTTag = $link.parents( '.CategoryTreeTag' );

			// Element may not have a .CategoryTreeTag parent, fallback to defauls
			// Probably a CategoryPage (@todo: based on what?)
			ctTitle = $link.data( 'ct-title' );
			ctMode = $linkParentCTTag.data( 'ct-mode' );
			ctMode = typeof ctMode === 'number' ? ctMode : undefined;
			ctOptions = $linkParentCTTag.data( 'ct-options' ) || mw.config.get( 'wgCategoryTreePageCategoryOptions' );

			// Mode and options have defaults or fallbacks, title does not.
			// Don't make a request if there is no title.
			if ( typeof ctTitle !== 'string' ) {
				error();
				return;
			}

			$.get(
			      mw.util.wikiScript(), {
			      	action: 'ajax',
			      	rs: 'efCategoryTreeAjaxWrapper',
			      	rsargs: [ctTitle, ctOptions, 'json']
			      }
			      )
			.done( function ( data ) {
				data = data.replace(/^\s+|\s+$/, '');
				data = data.replace(/##LOAD##/g, mw.msg( 'categorytree-expand' ) );

				if ( data === '' ) {
					switch ( ctMode ) {
						// CT_MODE_CATEGORIES = 0
						case 0:
						data = mw.msg( 'categorytree-no-subcategories' );
						break;
						// CT_MODE_PAGES = 10
						case 10:
						data = mw.msg( 'categorytree-no-pages' );
						break;
						// CT_MODE_PARENTS = 100
						case 100:
						data = mw.msg( 'categorytree-no-parent-categories' );
						break;
						// CT_MODE_ALL = 20
						default:
						data = mw.msg( 'categorytree-nothing-found' );
					}

					data = $( '<i class="CategoryTreeNotice"></i>' ).text( data );
				}

				$children
				.html( data )
				.find( '.CategoryTreeToggle' )
				.click( categoryTree.handleNode );

				categoryTree.showToggles();
				setLast();
			} )
			.fail( error );
		}
	};

	// Register click events and show toggle buttons
	$( function ( $ ) {
		$( '.CategoryTreeToggle' ).click( categoryTree.handleNode );
		categoryTree.showToggles();
		categoryTree.checkLast();
	} );


}( jQuery, mediaWiki ) );