CREATE TABLE quiz(
    quiz_id serial PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    created_by VARCHAR(30) NOT NULL
);

CREATE TYPE question_type AS ENUM ('single', 'multiple', 'sort', 'plain');

CREATE TABLE question(
    question_id serial PRIMARY KEY,
    quiz_id serial references quiz,
    description varchar(300),
    type question_type,
    possible_score integer
);

CREATE TABLE single_answer_set(
    single_answer_set_id serial PRIMARY KEY,
    question_id serial references question
);

CREATE TABLE single_answer(
    single_answer_id serial PRIMARY KEY,
    single_answer_set_id serial references single_answer_set,
    content VARCHAR(150)
);

ALTER TABLE single_answer_set
ADD COLUMN solution_id serial references single_answer;

CREATE TABLE multiple_answer_set(
    multiple_answer_set_id serial PRIMARY KEY,
    question_id serial references question
);

CREATE TABLE sort_answer_set(
    sort_answer_set_id serial PRIMARY KEY,
    question_id serial references question
);

CREATE TABLE plain_answer_set(
    plain_answer_set_id serial PRIMARY KEY,
    question_id serial references question,
    solution_text VARCHAR(150)
);

CREATE TABLE multiple_solution(
    multiple_solution_id serial PRIMARY KEY,
    multiple_answer_set_id serial references multiple_answer_set
);

CREATE TABLE multiple_answer(
    multiple_answer_id serial PRIMARY KEY,
    multiple_answer_set_id serial references multiple_answer_set,
    content VARCHAR(150)
);

ALTER TABLE multiple_solution
ADD COLUMN multiple_answer_id serial references multiple_answer;


CREATE TABLE sort_answer(
    sort_answer_id serial PRIMARY KEY,
    sort_answer_set_id serial references sort_answer_set,
    content VARCHAR(150),
    solution_weight integer
);