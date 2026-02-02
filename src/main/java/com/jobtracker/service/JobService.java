package com.jobtracker.service;

import com.jobtracker.model.Job;
import com.jobtracker.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class JobService {
    @Autowired
    private JobRepository jobRepository;

    public int addJob(Job job) {
        jobRepository.save(job);
        return 1;
    }

    public List<Job> getJobs(String email) {
        return jobRepository.findByUserEmail(email);
    }

    public int updateStatus(int id, String status) {
        return jobRepository.findById(id)
                .map(job -> {
                    job.setStatus(status);
                    jobRepository.save(job);
                    return 1;
                })
                .orElse(0);
    }

    public int updateJob(Job job) {
        if (jobRepository.existsById(job.getId())) {
            jobRepository.save(job);
            return 1;
        }
        return 0;
    }

    public int deleteJob(int id) {
        if (jobRepository.existsById(id)) {
            jobRepository.deleteById(id);
            return 1;
        }
        return 0;
    }
}