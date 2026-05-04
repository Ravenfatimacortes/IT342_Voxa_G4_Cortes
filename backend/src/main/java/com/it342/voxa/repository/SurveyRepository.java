package com.it342.voxa.repository;

import com.it342.voxa.entity.Survey;
import com.it342.voxa.entity.User;
import com.it342.voxa.entity.SurveyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Long> {
    
    List<Survey> findByCreatedBy(User user);
    
    List<Survey> findByStatus(SurveyStatus status);
    
    List<Survey> findByCreatedByAndStatus(User user, SurveyStatus status);
    
    @Query("SELECT s FROM survey s WHERE s.status = :status AND s.endDate > CURRENT_TIMESTAMP")
    List<Survey> findActiveSurveys(@Param("status") SurveyStatus status);
    
    @Query("SELECT s FROM survey s WHERE s.createdBy.id = :userId ORDER BY s.createdAt DESC")
    List<Survey> findByUserId(@Param("userId") Long userId);
}
