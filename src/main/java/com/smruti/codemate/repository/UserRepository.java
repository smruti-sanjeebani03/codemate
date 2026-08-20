package com.smruti.codemate.repository;

import com.smruti.codemate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}