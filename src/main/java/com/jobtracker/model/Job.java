package com.jobtracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @Column(nullable = false)
    private String userEmail;
    
    @Column(nullable = false)
    private String company;
    
    @Column(nullable = false)
    private String position;
    
    @Column(name = "applied_date", nullable = false)
    private LocalDate appliedDate;
    
    @Column(nullable = false)
    private String status;

    public Job() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public LocalDate getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDate appliedDate) { this.appliedDate = appliedDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}