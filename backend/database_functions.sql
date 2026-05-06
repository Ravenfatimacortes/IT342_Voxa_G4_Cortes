-- Database functions for Voxa application

-- Function to increment response count
CREATE OR REPLACE FUNCTION increment_response_count(survey_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE surveys 
    SET response_count = response_count + 1 
    WHERE id = survey_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get responses with answers
CREATE OR REPLACE FUNCTION get_survey_responses_with_answers(survey_id_param BIGINT)
RETURNS TABLE (
    response_id BIGINT,
    user_id BIGINT,
    submitted_at TIMESTAMPTZ,
    completion_time INTEGER,
    is_completed BOOLEAN,
    answer_id BIGINT,
    question_id BIGINT,
    answer_text TEXT,
    answer_options JSONB,
    rating INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as response_id,
        r.user_id,
        r.submitted_at,
        r.completion_time,
        r.is_completed,
        a.id as answer_id,
        a.question_id,
        a.answer_text,
        a.answer_options,
        a.rating
    FROM user_responses r
    LEFT JOIN answers a ON r.id = a.response_id
    WHERE r.survey_id = survey_id_param
    ORDER BY r.submitted_at DESC, a.question_id;
END;
$$ LANGUAGE plpgsql;
