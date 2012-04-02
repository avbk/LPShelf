<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class Shelf extends CI_Controller {

    function __construct() {
        parent::__construct();
	$this->output->set_header('Access-Control-Allow-Origin: sp://lpshelf');
    }

    public function index() {
        $this->output->set_status_header('404');
    }

    public function get($anonId = null, $lastUpdate = null) {
        if ($anonId == null || $lastUpdate == null) {
            $this->output->set_status_header('404');
        } else {
            $where = array('anonId' => $anonId);
            $chg = $this->db->get_where('changes', $where, 1);
            $lastChange = -1;
			$lastDel	= -1;
            if ($chg->num_rows() == 1) {
                $lastChange = $chg->row()->lastChange;
				$lastDel = $chg->row()->lastDeletion;
			}
			
			
            if ($lastChange > $lastUpdate) {
                $this->output->set_content_type('application/json');
				$json = array();
				$json['albums'] = array();
				
				$this->db->select('albumId')->from('playlist')->where('anonId', $anonId);
				if ($lastDel > $lastUpdate) {
					$json['type'] = 'full';
				} else {
					$json['type'] = 'delta';
					$this->db->where('added >', $lastUpdate);                
				}
				
				foreach ($this->db->get()->result() as $row)
					$json['albums'][] = $row->albumId;					
				
                $this->output->set_output(json_encode($json));
            } else {
                $this->output->set_status_header('204');
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
				$where['added'] = time();
                $this->db->insert('playlist', $where);
                $this->__touch($anonId, false);
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
                $this->__touch($anonId, true);
            }
        }
    }

    private function __touch($anonId, $deleted) {
        $where = array('anonId' => $anonId);
        $count = $this->db->get_where('changes', $where, 1)->num_rows();
		
		$data = array();
		$data['lastChange'] = time();
		if ($deleted)
			$data['lastDeletion'] = $data['lastChange'];
		
		if ($count == 1)
            $this->db->update('changes', $data, $where, 1);			
		else {
			$data['anonId'] = $anonId;
            $this->db->insert('changes', $data);
		}
    }

}

