package com.ratemyteacher.repository;

import com.ratemyteacher.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<Tag, Integer> {
    List<Tag> findByKeyIn(List<String> keys);

    List<Tag> findAllByOrderByCategoryAscLabelAsc();
}
