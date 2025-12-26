package com.ratemyteacher.controller;

import com.ratemyteacher.dto.TagDTO;
import com.ratemyteacher.entity.Tag;
import com.ratemyteacher.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "https://hello-world-five-peach.vercel.app"})
public class TagsController {

    private final TagRepository tagRepository;

    /**
     * GET /api/tags - Get all curated tags
     */
    @GetMapping
    public ResponseEntity<List<TagDTO>> getTags() {
        log.info("GET /api/tags");

        List<Tag> tags = tagRepository.findAllByOrderByCategoryAscLabelAsc();

        List<TagDTO> tagDTOs = tags.stream()
                .map(tag -> new TagDTO(tag.getKey(), tag.getLabel(), tag.getCategory()))
                .collect(Collectors.toList());

        log.info("Returning {} tags", tagDTOs.size());
        return ResponseEntity.ok(tagDTOs);
    }
}
