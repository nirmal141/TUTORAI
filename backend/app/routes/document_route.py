from flask import Blueprint, request, jsonify
from app.utils.supabase_client import get_supabase_client

document_upload_bp = Blueprint('document_upload', __name__)

@document_upload_bp.route('/upload', methods=['POST'])
def upload_document():
    try:
        # Get Supabase client
        supabase = get_supabase_client()

        # Get grade, subject, and teacher info from frontend
        grade = request.form.get('grade')
        subject = request.form.get('subject')
        teacher_id = request.form.get('teacher_id')

        # Get the file from frontend
        uploaded_file = request.files['file']
        file_data = uploaded_file.read()
        file_name = uploaded_file.filename
        
        # Validation checks
        if not grade or not subject or not uploaded_file:
            return jsonify({"error": "Grade, subject, and file are required"}), 400
        
        # Logic to insert the data into Supabase
        subject_record = supabase.table('subjects').select('id').eq('name', subject).single()
        if not subject_record:
            return jsonify({"error": "Subject not found"}), 404

        subject_id = subject_record['id']

        chapter_name = f"Chapter for {subject} in Grade {grade}"
        chapter_record = supabase.table('chapters').select('id').eq('subject_id', subject_id).eq('grade', grade).single()
        
        if not chapter_record:
            chapter_record = supabase.table('chapters').insert({
                'subject_id': subject_id,
                'grade': grade,
                'chapter_name': chapter_name
            }).execute()
        
        chapter_id = chapter_record['id']

        document_data = {
            'teacher_id': teacher_id,
            'subject_id': subject_id,
            'chapter_id': chapter_id,
            'grade': grade,
            'doc_name': file_name,
            'doc_data': file_data  # Store file as BLOB
        }
        
        result = supabase.table('documents').insert(document_data).execute()
        
        return jsonify({"message": "Document uploaded successfully", "document": result.data}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
