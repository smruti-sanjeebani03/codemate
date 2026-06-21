package com.smruti.codemate.repository;

import com.smruti.codemate.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

}