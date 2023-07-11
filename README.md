## How to run app

1. Run dockers in `docker` folder:\
`docker compose up -d`
2. Run app in root folder:\
`npm run start`

# Using the api
- GraphQL schema is available in schema.gql
## Mutation 
### addQuiz
- Takes QuizInput type variable and adds to database
- Doesn't take question input
### addQuestion
- Takes QuestionInput type variable and adds to database
- Quiz is associated with question by quizId variable in QuestionInput
### deleteQuiz
- Deletes Quiz with given id from database
- Cascade deletes all question associated
### removeQuestion
- deletes question with given id from database
## Query
### quizById
- fetches quiz associated with given id
### quizByTitle
- fetches all quizzes with given title
### solveQuiz
- Takes SolveQuizInput type
- quizId determines which quiz user would like to solve
- answers is array of strings, which are representation of answers chosen
- answers array should be the same size as the amount of questions in quiz
- answers correspond to questions at the same index in the `quiz.questions` array

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

### Important
Note that number of answers for question is not restricted, keep in mind that trying to answer
a question with incorrect string length(dependent on number of answers) will result in error.

Example queries are located in `gqlQueries` folder