select
  timestamp,
  JSON_EXTRACT_SCALAR(data, '$.setupId') as setup_id,
  JSON_EXTRACT_SCALAR(data, '$.childName') as child_name,
  JSON_EXTRACT_SCALAR(data, '$.parentName') as parent_name,
  JSON_EXTRACT_SCALAR(data, '$.treatment') as treatment,
  JSON_EXTRACT_SCALAR(data, '$.readThroughId') as read_through_id,
  JSON_EXTRACT_SCALAR(data, '$.bookId') as book_id,
  JSON_EXTRACT_SCALAR(data, '$.bookTitle') as book_title,
  JSON_EXTRACT_SCALAR(data, '$.pageNumber') as page_number,
  JSON_EXTRACT_SCALAR(data, '$.questionId') as question_id,
  JSON_EXTRACT_SCALAR(data, '$.questionText') as question_text,
  JSON_EXTRACT_SCALAR(data, '$.mode') as mode,
  JSON_EXTRACT_SCALAR(data, '$.difficulty') as difficulty,
  JSON_EXTRACT_SCALAR(data, '$.stimulusId') as stimulus_id,
  JSON_EXTRACT_SCALAR(data, '$.isCorrect') as is_correct,
from adaptive_ebook_firestore.responses_raw_latest r
where JSON_EXTRACT_SCALAR(data, '$.deploy') = 'production'
order by timestamp desc;

