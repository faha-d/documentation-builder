<?php

if (! defined('ABSPATH')) {
    exit;
}

add_action(
    'rest_api_init',
    function () {

        register_rest_route(
            'documentation-builder/v1',
            '/import',
            array(
                'methods'  => 'POST',
                'callback' => 'documentation_builder_import_docx',
                'permission_callback' => function () {
                    return current_user_can('upload_files');
                },
            )
        );
    }
);

function documentation_builder_import_docx(WP_REST_Request $request)
{

    $url = esc_url_raw(
        $request->get_param('url')
    );

    if (empty($url)) {

        return new WP_Error(
            'missing_url',
            'Google Docs URL is required.'
        );
    }

    /*
|--------------------------------------------------------------------------
| Extract Google Document ID
|--------------------------------------------------------------------------
*/

    if (
        ! preg_match(
            '#/document/d/([a-zA-Z0-9_-]+)#',
            $url,
            $matches
        )
    ) {

        return new WP_Error(
            'invalid_url',
            'Invalid Google Docs URL.'
        );
    }

    $document_id = $matches[1];

    /*
|--------------------------------------------------------------------------
| DOCX Export URL
|--------------------------------------------------------------------------
*/

    $download_url = sprintf(
        'https://docs.google.com/document/d/%s/export?format=docx',
        $document_id
    );

    /*
|--------------------------------------------------------------------------
| Download temporary DOCX
|--------------------------------------------------------------------------
*/

    require_once ABSPATH . 'wp-admin/includes/file.php';

    $temp_file = download_url($download_url);

    if (is_wp_error($temp_file)) {

        return $temp_file;
    }

    /*
|--------------------------------------------------------------------------
| Parse DOCX
|--------------------------------------------------------------------------
*/

    $parser = new Docx_Parser($temp_file);

    $result = $parser->parse();

    /*
|
| Delete temporary file
|--------------------------------------------------------------------------
*/

    @unlink($temp_file);

    return rest_ensure_response($result);
}
