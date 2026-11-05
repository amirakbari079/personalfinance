package com.personalfinance.foundation;
import com.personalfinance.common.ApiResponse;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/management")
public class ManagementController {
 private final ManagementService service;
 public ManagementController(ManagementService service){this.service=service;}
 @GetMapping("/{resource}") public Object list(@PathVariable String resource,@RequestParam(required=false) String q,@RequestParam(required=false) String kind,@RequestParam(defaultValue="false") boolean all,@RequestParam(defaultValue="0") int offset,@RequestParam(defaultValue="100") int limit){return ApiResponse.ok(service.list(resource,q,kind,all,offset,limit));}
 @GetMapping("/{resource}/{id}") public Object get(@PathVariable String resource,@PathVariable long id){return ApiResponse.ok(service.get(resource,id));}
 @PostMapping("/{resource}") public Object create(@PathVariable String resource,@RequestBody Map<String,Object> body){return ApiResponse.ok(service.save(resource,null,body));}
 @PutMapping("/{resource}/{id}") public Object update(@PathVariable String resource,@PathVariable long id,@RequestBody Map<String,Object> body){return ApiResponse.ok(service.save(resource,id,body));}
 @DeleteMapping("/{resource}/{id}") public Object archive(@PathVariable String resource,@PathVariable long id,@RequestParam long version){service.deactivate(resource,id,version);return ApiResponse.ok("بایگانی شد",null);}
}
