import { supabase } from './supabase';
import type { 
  Profile, 
  TeacherStudentRelationship, 
  Class, 
  ClassEnrollment, 
  Institution
} from './supabase';

/**
 * Get all students for a specific teacher
 */
export async function getTeacherStudents(teacherId: string) {
  try {
    // Get the relationships
    const { data: relationships, error: relError } = await supabase
      .from('teacher_student_relationships')
      .select('student_id')
      .eq('teacher_id', teacherId);
    
    if (relError) {
      console.error('Error fetching teacher-student relationships:', relError);
      return { data: null, error: relError };
    }
    
    if (!relationships || relationships.length === 0) {
      return { data: [], error: null };
    }
    
    // Get all student profiles
    const studentIds = relationships.map(rel => rel.student_id);
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', studentIds)
      .eq('role', 'student');
    
    if (studentsError) {
      console.error('Error fetching student profiles:', studentsError);
      return { data: null, error: studentsError };
    }
    
    return { data: students, error: null };
  } catch (error) {
    console.error('Error in getTeacherStudents:', error);
    return { data: null, error };
  }
}

/**
 * Assign a student to a teacher
 */
export async function assignStudentToTeacher(
  teacherId: string, 
  studentId: string, 
  institutionId: string
) {
  try {
    // Verify that both users exist and have correct roles
    const { data: teacher, error: teacherError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', teacherId)
      .eq('role', 'teacher')
      .single();
    
    if (teacherError || !teacher) {
      console.error('Teacher not found or not a teacher:', teacherError);
      return { data: null, error: 'Teacher not found or invalid role' };
    }
    
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .eq('role', 'student')
      .single();
    
    if (studentError || !student) {
      console.error('Student not found or not a student:', studentError);
      return { data: null, error: 'Student not found or invalid role' };
    }
    
    // Check if relation already exists
    const { data: existingRel, error: existingError } = await supabase
      .from('teacher_student_relationships')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('student_id', studentId)
      .single();
    
    if (existingRel) {
      return { data: existingRel, error: 'Relationship already exists' };
    }
    
    // Create the relationship
    const { data, error } = await supabase
      .from('teacher_student_relationships')
      .insert({
        teacher_id: teacherId,
        student_id: studentId,
        institution_id: institutionId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating teacher-student relationship:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in assignStudentToTeacher:', error);
    return { data: null, error };
  }
}

/**
 * Remove a student from a teacher
 */
export async function removeStudentFromTeacher(teacherId: string, studentId: string) {
  try {
    const { error } = await supabase
      .from('teacher_student_relationships')
      .delete()
      .eq('teacher_id', teacherId)
      .eq('student_id', studentId);
    
    if (error) {
      console.error('Error removing teacher-student relationship:', error);
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error in removeStudentFromTeacher:', error);
    return { error };
  }
}

/**
 * Create a new class
 */
export async function createClass(classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert(classData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating class:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in createClass:', error);
    return { data: null, error };
  }
}

/**
 * Get classes for a teacher
 */
export async function getTeacherClasses(teacherId: string) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId);
    
    if (error) {
      console.error('Error fetching teacher classes:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getTeacherClasses:', error);
    return { data: null, error };
  }
}

/**
 * Enroll a student in a class
 */
export async function enrollStudentInClass(classId: string, studentId: string) {
  try {
    // Check if already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('class_enrollments')
      .select('*')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .single();
    
    if (existingEnrollment) {
      return { data: existingEnrollment, error: 'Student already enrolled' };
    }
    
    const { data, error } = await supabase
      .from('class_enrollments')
      .insert({
        class_id: classId,
        student_id: studentId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error enrolling student in class:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in enrollStudentInClass:', error);
    return { data: null, error };
  }
}

/**
 * Get all classes a student is enrolled in
 */
export async function getStudentClasses(studentId: string) {
  try {
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('class_enrollments')
      .select('class_id')
      .eq('student_id', studentId);
    
    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return { data: null, error: enrollmentsError };
    }
    
    if (!enrollments || enrollments.length === 0) {
      return { data: [], error: null };
    }
    
    const classIds = enrollments.map(enrollment => enrollment.class_id);
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*, profiles!classes_teacher_id_fkey(full_name)')
      .in('id', classIds);
    
    if (classesError) {
      console.error('Error fetching classes:', classesError);
      return { data: null, error: classesError };
    }
    
    return { data: classes, error: null };
  } catch (error) {
    console.error('Error in getStudentClasses:', error);
    return { data: null, error };
  }
}

/**
 * Get all institutions
 */
export async function getInstitutions() {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching institutions:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getInstitutions:', error);
    return { data: null, error };
  }
}

/**
 * Create a new institution
 */
export async function createInstitution(
  name: string, 
  domain: string
) {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .insert({
        name,
        domain
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating institution:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in createInstitution:', error);
    return { data: null, error };
  }
} 