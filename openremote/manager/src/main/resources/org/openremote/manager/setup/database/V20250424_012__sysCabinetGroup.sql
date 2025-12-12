INSERT INTO sys_cabinet_group
(cabinet_grp_id, cabinet_grp_code, cabinet_grp_name, active, create_date, create_by, update_date, update_by)
VALUES(nextval('sys_cabinet_group_cabinet_grp_id_seq'::regclass), 'P1', 'power_sts_1', true, now(), '', now(), ''),
(nextval('sys_cabinet_group_cabinet_grp_id_seq'::regclass), 'P2', 'power_sts_2', true, now(), '', now(), ''),
(nextval('sys_cabinet_group_cabinet_grp_id_seq'::regclass), 'P3', 'power_sts_3', true, now(), '', now(), ''),
(nextval('sys_cabinet_group_cabinet_grp_id_seq'::regclass), 'P4', 'power_sts_4', true, now(), '', now(), '');
