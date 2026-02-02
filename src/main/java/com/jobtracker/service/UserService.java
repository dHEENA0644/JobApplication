package com.jobtracker.service;

import com.jobtracker.model.User;
import com.jobtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public boolean register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return false;
        }
        userRepository.save(user);
        return true;
    }

    public boolean login(String email, String password) {
        User user = userRepository.findByEmail(email);
        return user != null && user.getPassword().equals(password);
    }
}