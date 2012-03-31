<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class Shelf extends CI_Controller {

    function __construct() {
        parent::__construct();
		
		$this->output->set_header('Access-Control-Allow-Origin: *');
    }

    public function index() {
        $this->output->set_status_header('404');
    }

    public function get($anonId = null, $lastUpdate = null) {
        if ($anonId == null || $lastUpdate == null) {
            $this->output->set_status_header('404');
        } else {
            $where = array('anonId' => $anonId);
            $q = $this->db->get_where('changes', $where, 1);
            if ($q->num_rows() == 0 || $q->row()->lastChange > $lastUpdate) {
                $this->output->set_content_type('application/json');

                $albums = array();
                foreach ($this->db->select('albumId')->from('playlist')->where('anonId', $anonId)->get()->result() as $row)
                    $albums[] = $row->albumId;
                $this->output->set_output(json_encode($albums));
            } else {
                $this->output->set_status_header('304');
            }
        }
    }

    public function add($anonId = null, $albumId = null) {
        if ($anonId == null || $albumId == null) {
            $this->output->set_status_header('404');
        } else {
            $where = array('anonId' => $anonId, 'albumId' => $albumId);
            $count = $this->db->get_where('playlist', $where, 1)->num_rows();
            if ($count == 0) {
                $this->db->insert('playlist', $where);
                $this->__touch($anonId);
            }
        }
    }

    public function remove($anonId = null, $albumId = null) {
        if ($anonId == null || $albumId == null) {
            $this->output->set_status_header('404');
        } else {
            $where = array('anonId' => $anonId, 'albumId' => $albumId);
            $count = $this->db->get_where('playlist', $where, 1)->num_rows();
            if ($count == 1) {
                $this->db->delete('playlist', $where, 1);
                $this->__touch($anonId);
            }
        }
    }

    private function __touch($anonId) {
        $where = array('anonId' => $anonId);
        $count = $this->db->get_where('changes', $where, 1)->num_rows();
        $data = array('lastChange' => time());

        if ($count == 1)
            $this->db->update('changes', $data, $where, 1);
        else
            $this->db->insert('changes', $data);
    }

}

