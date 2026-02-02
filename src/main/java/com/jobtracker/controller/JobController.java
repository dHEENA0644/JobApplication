package com.jobtracker.controller;

import com.jobtracker.model.Job;
import com.jobtracker.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class JobController {
    @Autowired
    private JobService service;

    @PostMapping("/addJob")
    public String addJob(@RequestBody Job job) {
        return service.addJob(job) > 0 ? "success" : "fail";
    }

    @GetMapping("/getJobs")
    public List<Job> getJobs(@RequestParam String email) {
        return service.getJobs(email);
    }

    @PutMapping("/updateStatus")
    public String updateStatus(@RequestBody Map<String, Object> req) {
        try {
            // Check if it's a full job update or just status update
            if (req.containsKey("company") || req.containsKey("position") || req.containsKey("appliedDate")) {
                // Full job update
                Job job = new Job();
                Object idObj = req.get("id");
                job.setId(idObj instanceof Integer ? (Integer) idObj : Integer.parseInt(idObj.toString()));
                if (req.containsKey("company")) job.setCompany((String) req.get("company"));
                if (req.containsKey("position")) job.setPosition((String) req.get("position"));
                if (req.containsKey("status")) job.setStatus((String) req.get("status"));
                if (req.containsKey("appliedDate")) {
                    String dateStr = (String) req.get("appliedDate");
                    job.setAppliedDate(java.time.LocalDate.parse(dateStr));
                }
                if (req.containsKey("userEmail")) job.setUserEmail((String) req.get("userEmail"));
                return service.updateJob(job) > 0 ? "updated" : "failed";
            } else {
                // Status-only update
                Object idObj = req.get("id");
                int id = idObj instanceof Integer ? (Integer) idObj : Integer.parseInt(idObj.toString());
                String status = (String) req.get("status");
                return service.updateStatus(id, status) > 0 ? "updated" : "failed";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }

    @DeleteMapping("/deleteJob/{id}")
    public String deleteJob(@PathVariable int id) {
        return service.deleteJob(id) > 0 ? "deleted" : "failed";
    }
}