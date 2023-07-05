INSERT INTO quiz (name, created_by) values ('Polish History Quiz', 'Dariusz Wawiórko');

-- single answer question

INSERT INTO question (quiz_id, description, type, possible_score)
values (1, 'When was the Battle of Grunwald fought?', 'single', 1);

INSERT INTO single_answer(question_id, content)
values (1, '1408'), (1, '1409'), (1, '1411');

INSERT INTO single_answer_solution(question_id, content)
values (1, '1410');

-- multiple answers question

INSERT INTO question (quiz_id, description, type, possible_score)
values (1, 'Who of the following were polish kings?', 'multiple', 2);

INSERT INTO multiple_answer (question_id, content)
values (2, 'Mieszko I'), (2, 'Bezprym');

INSERT INTO multiple_answer_solution (question_id, content)
values (2, 'Bolesław I Chrobry'), (2, 'Mieszko II');

-- plain answer question

INSERT INTO question (quiz_id, description, type, possible_score)
values (1, 'When did Poland disappear from the maps?', 'plain', 1);

INSERT INTO plain_answer (question_id, solution_text)
values (3, '1795');

-- sort_answer

INSERT INTO question (quiz_id, description, type, possible_score)
values (1, 'Sort the events chronologically.', 'sort', 2);

INSERT INTO sort_answer (question_id, content, solution_weight)
values (4, 'Baptism of Poland', 1);

INSERT INTO sort_answer (question_id, content, solution_weight)
values (4, 'Congress of Gniezno', 2);

INSERT INTO sort_answer (question_id, content, solution_weight)
values (4, 'Establishment of Jagiellonian University', 3);

INSERT INTO sort_answer (question_id, content, solution_weight)
values (4, 'Union of Lublin', 4);