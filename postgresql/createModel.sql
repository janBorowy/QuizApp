CREATE TABLE quiz(
    id serial PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    created_by VARCHAR(30) NOT NULL
);

CREATE TYPE question_type AS ENUM ('single', 'multiple', 'sort', 'plain');

CREATE TABLE question(
    id serial PRIMARY KEY,
    quiz_id serial references quiz,
    description varchar(300),
    type question_type,
    possible_score integer
);

CREATE TABLE single_answer(
    id serial PRIMARY KEY,
    question_id serial references question,
    content VARCHAR(150)
);

CREATE TABLE single_answer_solution(
    id serial PRIMARY KEY,
    question_id serial references question,
    content VARCHAR(150)
);

CREATE TABLE plain_answer(
    id serial PRIMARY KEY,
    question_id serial references question,
    solution_text VARCHAR(150)
);

CREATE TABLE multiple_answer_solution(
    id serial PRIMARY KEY,
    question_id serial references question,
    content VARCHAR(150)
);

CREATE TABLE multiple_answer(
    id serial PRIMARY KEY,
    question_id serial references question,
    content VARCHAR(150)
);


CREATE TABLE sort_answer(
    id serial PRIMARY KEY,
    question_id serial references question,
    content VARCHAR(150),
    solution_weight integer
);