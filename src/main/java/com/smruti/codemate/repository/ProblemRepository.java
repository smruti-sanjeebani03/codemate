package com.smruti.codemate.repository;

import com.smruti.codemate.model.Problem;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProblemRepository extends MongoRepository<Problem, String> {

}
