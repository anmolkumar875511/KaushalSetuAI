export const calculateAssessmentScore = (questions) => {
    const difficultyWeight = {
        easy: 5,
        medium: 10,
        hard: 15,
    };

    let score = 0;

    questions.forEach((q) => {
        if (q.userAnswer && q.userAnswer === q.correctAnswer) {
            score += difficultyWeight[q.level];
        }
    });

    return score;
};
