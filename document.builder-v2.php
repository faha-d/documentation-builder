<?php
/**
 * Plugin Name: Documentation Builder
 * Description: Import DOCX files into editable documentation.
 * Version: 1.0.0
 * Author: Fahad
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/includes/class-docx-parser.php';
require_once __DIR__ . '/includes/class-rest-api.php';

function documentation_builder_register_block() {

	register_block_type( __DIR__ . '/build' );

}

add_action(
	'init',
	'documentation_builder_register_block'
);