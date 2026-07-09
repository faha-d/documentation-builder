<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}


class Docx_Parser
{
    private $image_map = [];
    private $file;
    private $zip;
    private $xpath;

    public function __construct($file)
    {

        $this->file = $file;
    }

    // public function parse()
    // {

    //     $this->open();
    //     $nodes = $this->parse_nodes();
    //     $this->zip->close();

    //     // return $this->build_document($nodes);

    //     return [
    //         'nodes' => $nodes,
    //     ];
    // }

    public function parse()
    {
        $this->open();

        $nodes = $this->parse_nodes();

        $document = $this->build_document($nodes);

        $this->zip->close();

        return $document;
    }

    private function build_document($nodes)
    {
        $document = [
            'title'    => '',
            'intro'    => [],
            'sections' => [],
        ];

        $current_section = null;
        $current_list = null;
        $last_list_item = null;

        foreach ($nodes as $node) {

            $style = $node['style'];
            $text  = $node['text'];

            if ($node['image']) {

                if (
                    $current_section !== null &&
                    $current_list !== null &&
                    $last_list_item !== null
                ) {

                    $current_section['blocks'][$current_list]['items'][$last_list_item]['image'] =
                        $this->upload_docx_image(
                            $node['image']
                        );
                }

                continue;
            }

            if ($style === 'Heading1') {

                $document['title'] = $text;

                continue;
            }

            if (preg_match('/Heading[2-6]/', $style)) {

                if ($current_section !== null) {

                    $document['sections'][] = $current_section;
                }

                $current_section = [

                    'title'  => $text,

                    'blocks' => [],

                ];

                $current_list = null;
                $last_list_item = null;

                continue;
            }

            if ($current_section === null) {

                $document['intro'][] = [

                    'type' => 'paragraph',

                    'text' => $text,

                ];

                continue;
            }

            if ($node['list']) {

                if ($current_list === null) {

                    $current_section['blocks'][] = [

                        'type'  => 'list',

                        'items' => [],

                    ];

                    $current_list = count(
                        $current_section['blocks']
                    ) - 1;
                }

                $current_section['blocks'][$current_list]['items'][] = [

                    'text'  => $text,

                    'image' => null,

                ];

                $last_list_item = count(
                    $current_section['blocks'][$current_list]['items']
                ) - 1;

                continue;
            }

            $current_list = null;
            $last_list_item = null;

            $current_section['blocks'][] = [

                'type' => 'paragraph',

                'text' => $text,

            ];
        }

        if ($current_section !== null) {

            $document['sections'][] = $current_section;
        }

        return $document;
    }

    private function open()
    {

        $this->zip = new ZipArchive();

        if (true !== $this->zip->open($this->file)) {
            throw new Exception('Could not open the docx file.');
        }

        $xml = $this->zip->getFromName('word/document.xml');
        $dom = new DOMDocument();
        $dom->loadXML($xml);

        $this->xpath = new DOMXPath($dom);

        $this->xpath->registerNamespace(
            'w',
            'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
        );

        $this->xpath->registerNamespace(
            'a',
            'http://schemas.openxmlformats.org/drawingml/2006/main'
        );

        $this->xpath->registerNamespace(
            'r',
            'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
        );

        $this->xpath->registerNamespace(
            'wp',
            'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
        );

        $this->xpath->registerNamespace(
            'pic',
            'http://schemas.openxmlformats.org/drawingml/2006/picture'
        );
    }

    private function parse_nodes()
    {

        $nodes = [];

        $paragraphs = $this->xpath->query(
            '//w:body/w:p'
        );

        foreach ($paragraphs as $paragraph) {

            $text = trim(
                $this->get_text(
                    $paragraph
                )
            );

            $image = $this->get_image_relationship(
                $paragraph
            );

            if ($text === '' && $image === null) {
                continue;
            }

            $style = $this->get_style(
                $paragraph
            );

            $is_list = $this->is_list(
                $paragraph
            );

            $nodes[] = [

                'style' => $style,

                'list' => $is_list,

                'image' => $image,

                'text' => $text,

            ];
        }

        return $nodes;
    }

    private function get_text(DOMElement $paragraph)
    {

        $text = '';

        $nodes = $this->xpath->query(
            './/w:t',
            $paragraph
        );

        foreach ($nodes as $node) {

            $text .= $node->textContent;
        }

        return $text;
    }

    private function get_style(DOMElement $paragraph)
    {

        $style = $this->xpath->query(
            './w:pPr/w:pStyle',
            $paragraph
        );

        if ($style->length) {

            return $style->item(0)->getAttribute(
                'w:val'
            );
        }

        return 'Normal';
    }

    private function is_list(DOMElement $paragraph)
    {

        return $this->xpath->query(
            './w:pPr/w:numPr',
            $paragraph
        )->length > 0;
    }

    private function get_image_relationship(DOMElement $paragraph)
    {
        $nodes = $this->xpath->query(
            './/*[local-name()="blip" or local-name()="imagedata"]',
            $paragraph
        );

        if (!$nodes || !$nodes->length) {
            return null;
        }

        $relNamespace = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

        foreach ($nodes as $node) {
            $relationship = $node->getAttributeNS(
                $relNamespace,
                'embed'
            );

            if ($relationship !== '') {
                return $relationship;
            }

            $relationship = $node->getAttributeNS(
                $relNamespace,
                'link'
            );

            if ($relationship !== '') {
                return $relationship;
            }

            $relationship = $node->getAttributeNS(
                $relNamespace,
                'id'
            );

            if ($relationship !== '') {
                return $relationship;
            }
        }

        return null;
    }

    private function get_image_map()
    {
        if (!empty($this->image_map)) {
            return $this->image_map;
        }

        $xml = $this->zip->getFromName(
            'word/_rels/document.xml.rels'
        );

        $dom = new DOMDocument();
        $dom->loadXML($xml);

        $xpath = new DOMXPath($dom);

        $xpath->registerNamespace(
            'rel',
            'http://schemas.openxmlformats.org/package/2006/relationships'
        );

        $map = [];

        $relationships = $xpath->query('//rel:Relationship');

        foreach ($relationships as $relationship) {

            if (!($relationship instanceof DOMElement)) {
                continue;
            }

            $type = $relationship->getAttribute('Type');

            if (strpos($type, '/image') === false) {
                continue;
            }

            $id = $relationship->getAttribute('Id');

            $target = $relationship->getAttribute('Target');

            $map[$id] = $target;
        }

        $this->image_map = $map;

        return $map;
    }

    private function upload_docx_image($relationship)
    {
        $map = $this->get_image_map();

        if (!isset($map[$relationship])) {
            return null;
        }

        $file = 'word/' . $map[$relationship];

        $contents = $this->zip->getFromName($file);

        if ($contents === false) {
            return null;
        }

        $filename = basename($file);

        $upload = wp_upload_bits(
            $filename,
            null,
            $contents
        );

        if (!empty($upload['error'])) {
            return null;
        }

        $attachment = [

            'post_mime_type' => wp_check_filetype($filename)['type'],

            'post_title' => pathinfo($filename, PATHINFO_FILENAME),

            'post_status' => 'inherit',

        ];

        $attachment_id = wp_insert_attachment(
            $attachment,
            $upload['file']
        );

        require_once ABSPATH . 'wp-admin/includes/image.php';

        $metadata = wp_generate_attachment_metadata(
            $attachment_id,
            $upload['file']
        );

        wp_update_attachment_metadata(
            $attachment_id,
            $metadata
        );

        return wp_get_attachment_url($attachment_id);
    }
}
