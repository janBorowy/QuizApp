## How to run app

1. Run dockers in `docker` folder:\
`docker compose up -d`
2. Install dependencies:
`npm install`
3. Run app in root folder:\
`npm run start`

# Using the api
- GraphQL schema is available in schema.gql
## Mutation 
### addQuiz
- Takes QuizInput type variable and adds to database
- Questions order won't be kept
### deleteQuiz
- Deletes Quiz with given id from database
- Cascade deletes all question associated
## Query
### quiz
- fetches quiz associated with given id
### quizByTitle
- fetches all quizzes with given title
### solveQuiz
- Takes SolveQuizInput type
- quizId determines which quiz user would like to solve
- answers is an array of AnswerInputs
- valid query should answer all questions of given quiz and should answer them once
- result is of SolveResult type

## How to input solutions and answers
- QuestionInput type contains variable correctAnswerString and type
- Depending on type of question the correctAnswerString should be of different format

Single questions:
- have only one correct answer
correctAnswerString: "n" where n is index of correct answer from question.answers array
example:
- description: "The answer is C"
- answers: [A,B,C,D]
- solution: "2"

Multiple questions:
- have multiple correct answers
- score is weighted depending on how correct answer was
correctAnswerString: "xxxx" where x is either 0 or 1 depending on whether answer at current index is correct
example:
- description: "The answer is A and C"
- answers: [A,B,C,D]
- solution:"1010"

Plain questions:
- Have one text answer
- both correctAnswerString and solution are trimmed
correctAnswerString: exactly the answer
example:
- description: "Type ABC"
- answers: [] - contents don't matter
- solution: "ABC"

Sort questions:
- answers must be ordered correctly
- score is weighted depending on how correct answer was
correctAnswerString: "abcd" where a,b,c,d is index at which first,second,third and fourth
answer should be in resulting array
example:
- description: "D then B then C then A"
- answers: [A, B, C, D]
- solution: "3120"
- explanation: A should be at third index, D should be at zeroth etc.

Example queries are located in `gqlQueries` folder