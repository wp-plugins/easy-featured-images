(function( $ ) {
	'use strict';

	/* global wp, console */

	var file_frame, post_id, nonce, efi_thumbnail;

    jQuery(document).on('click', '.efi-choose-image', function( event ){
        post_id = $(this).parents('tr:first').attr('id').replace( 'post-', '' );
        nonce = $(this).data('nonce');
        efi_thumbnail = $(this).parents( '.efi-thumbnail' );

        /**
		 * If an instance of file_frame already exists, then we can open it
		 * rather than creating a new instance.
		 */
		if ( undefined !== file_frame ) {
			file_frame.open();
			return false;
		}

		/**
		 * If we're this far, then an instance does not exist, so we need to
		 * create our own.
		 *
		 * Here, use the wp.media library to define the settings of the Media
		 * Uploader implementation by setting the title and the upload button
		 * text. We're also not allowing the user to select more than one image.
		 */
		file_frame = wp.media.frames.file_frame = wp.media({
			title:    efi_strings.browse_images,
			button:   {
				text: efi_strings.select_image
			},
			multiple: false
		});

        /**
		 * Setup an event handler for what to do when an image has been
		 * selected.
		 */
		file_frame.on( 'select', function() {
			var image_data = file_frame.state().get( 'selection' ).first().toJSON();
            var thumbnail = image_data.sizes.thumbnail;
            var medium = image_data.sizes.medium;

            if( efi_thumbnail.hasClass( 'no-image' ) ) {
                efi_thumbnail.removeClass( 'no-image' );

                var link = efi_thumbnail.find('a.efi-choose-image');
                link.html('').clone().insertAfter(link);

                var thumbnail_image = $('<img>').attr({
                    width: thumbnail.width,
                    height : thumbnail.height,
                    class : 'attachment-thumbnail wp-post-image',
                    src : thumbnail.url,
                    alt : image_data.alt
                })

                var medium_image = $('<img>').attr({
                    width: medium.width,
                    height : medium.height,
                    class : 'attachment-medium wp-post-image',
                    src : medium.url,
                    alt : image_data.alt
                })

                efi_thumbnail.find('a.efi-choose-image:first').html( thumbnail_image );
                efi_thumbnail.find('a.efi-choose-image:last').html( medium_image );
                efi_thumbnail.find('a.efi-choose-image').wrapAll( "<div class='efi-images' />");

            }
            else {
                efi_thumbnail.find('.attachment-thumbnail').attr( 'src', thumbnail.url );
                efi_thumbnail.find('.attachment-medium').attr( 'src', medium.url );
            }

            $.post( efi_strings.ajaxurl, {
                _ajax_nonce: nonce,
                post_id : post_id,
                thumbnail_id : image_data.id,
                action: 'set-post-thumbnail'
            })


		});

		// Now display the actual file_frame
		file_frame.open();

        return false;
    });

$(document).on( 'click', '.efi-remove-image', function() {
    efi_thumbnail = $(this).parents( '.efi-thumbnail' );
    nonce = $(this).data('nonce');
    var url = $(this).attr('href');
    var post_id = parseInt( efi_thumbnail.parents('tr:first').attr('id').replace( 'post-', '' ) );

    efi_thumbnail.addClass( 'no-image' );

    var choose_image = $('<a>').attr({
        href : url,
        'data-nonce' : nonce,
        class : 'efi-choose-image'
    }).html("<i class='dashicons dashicons-plus'></i> <br> " + efi_strings.add_image + "</a>")

    efi_thumbnail.find('.efi-images').html(choose_image);

    $.post( efi_strings.ajaxurl, {
        _ajax_nonce: nonce,
        post_id : post_id,
        thumbnail_id : -1,
        action: 'set-post-thumbnail'
    })

    return false;
})

})( jQuery );
