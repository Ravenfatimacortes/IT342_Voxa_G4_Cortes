import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Save,
  Eye,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateSurvey = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      questions: [
        {
          questionText: '',
          type: 'SHORT_ANSWER',
          required: true,
          order: 0,
          options: []
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  const watchedQuestions = watch('questions');

  const addQuestion = () => {
    const newOrder = fields.length;
    append({
      questionText: '',
      type: 'SHORT_ANSWER',
      required: true,
      order: newOrder,
      options: []
    });
  };

  const removeQuestion = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const addOption = (questionIndex) => {
    const currentOptions = watchedQuestions[questionIndex]?.options || [];
    const newOptions = [...currentOptions, ''];
    const fieldName = `questions.${questionIndex}.options`;
    // This is a workaround for react-hook-form array update
    const currentValues = watch(fieldName);
    setValue(fieldName, [...(currentValues || []), '']);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const fieldName = `questions.${questionIndex}.options`;
    const currentOptions = watch(fieldName);
    const newOptions = currentOptions.filter((_, index) => index !== optionIndex);
    setValue(fieldName, newOptions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const fieldName = `questions.${questionIndex}.options.${optionIndex}`;
    setValue(fieldName, value);
  };

  const changeQuestionType = (questionIndex, newType) => {
    const fieldName = `questions.${questionIndex}.type`;
    setValue(fieldName, newType);
    
    if (newType === 'MULTIPLE_CHOICE') {
      const optionsFieldName = `questions.${questionIndex}.options`;
      const currentOptions = watch(optionsFieldName) || [];
      if (currentOptions.length === 0) {
        setValue(optionsFieldName, ['Option 1', 'Option 2']);
      }
    } else {
      const optionsFieldName = `questions.${questionIndex}.options`;
      setValue(optionsFieldName, []);
    }
  };

  const saveAsDraft = async (data) => {
    try {
      setSubmitting(true);
      const response = await api.post('/admin/surveys', data);
      toast.success('Survey saved as draft!');
      navigate('/faculty/surveys');
    } catch (error) {
      console.error('Error saving survey:', error);
      toast.error(error.response?.data?.error || 'Failed to save survey');
    } finally {
      setSubmitting(false);
    }
  };

  const publishSurvey = async (data) => {
    try {
      setPublishing(true);
      const response = await api.post('/admin/surveys', data);
      const surveyId = response.data.survey._id;
      
      await api.post(`/admin/surveys/${surveyId}/publish`);
      toast.success('Survey published successfully!');
      navigate('/faculty/surveys');
    } catch (error) {
      console.error('Error publishing survey:', error);
      toast.error(error.response?.data?.error || 'Failed to publish survey');
    } finally {
      setPublishing(false);
    }
  };

  const onSubmit = (data) => {
    // Validate questions
    for (let i = 0; i < data.questions.length; i++) {
      const question = data.questions[i];
      if (!question.questionText.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return;
      }
      
      if (question.type === 'MULTIPLE_CHOICE') {
        const validOptions = question.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          toast.error(`Question ${i + 1} needs at least 2 options`);
          return;
        }
      }
    }
    
    publishSurvey(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/faculty/surveys')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Surveys
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">Create Survey</h1>
          <p className="mt-1 text-sm text-gray-600">
            Design a new survey for students
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Survey Details */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Survey Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="mt-1 input"
                  placeholder="Enter survey title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 input"
                  placeholder="Provide a brief description of the survey"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-outline flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">Question {index + 1}</h3>
                    </div>
                    
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Question Text *
                      </label>
                      <input
                        {...register(`questions.${index}.questionText`, { 
                          required: 'Question text is required' 
                        })}
                        type="text"
                        className="mt-1 input"
                        placeholder="Enter your question"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Question Type
                        </label>
                        <select
                          {...register(`questions.${index}.type`)}
                          onChange={(e) => changeQuestionType(index, e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        >
                          <option value="SHORT_ANSWER">Short Answer</option>
                          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          {...register(`questions.${index}.required`)}
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Required question
                        </label>
                      </div>
                    </div>

                    {/* Multiple Choice Options */}
                    {watchedQuestions[index]?.type === 'MULTIPLE_CHOICE' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {(watchedQuestions[index]?.options || []).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                className="flex-1 input"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              {(watchedQuestions[index]?.options || []).length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(index, optionIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(index)}
                            className="btn-outline text-sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleSubmit(saveAsDraft)}
            disabled={submitting}
            className="btn-outline disabled:opacity-50"
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </>
            )}
          </button>
          
          <button
            type="submit"
            disabled={publishing}
            className="btn-primary disabled:opacity-50"
          >
            {publishing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publishing...
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Publish Survey
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSurvey;
