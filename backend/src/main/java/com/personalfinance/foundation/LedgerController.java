package com.personalfinance.foundation;
import com.personalfinance.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController @RequestMapping("/api/v1/ledger")
public class LedgerController {
 private final LedgerService service;public LedgerController(LedgerService service){this.service=service;}
 @GetMapping("/accounts") public Object accounts(){return ApiResponse.ok(service.accounts());}
 @GetMapping("/transactions") public Object list(@RequestParam(required=false) Long accountId,@RequestParam(required=false) LocalDate from,@RequestParam(required=false) LocalDate to,@RequestParam(required=false) String q,@RequestParam(defaultValue="0") int offset,@RequestParam(defaultValue="50") int limit){return ApiResponse.ok(service.list(accountId,from,to,q,offset,limit));}
 @GetMapping("/transactions/{id}") public Object get(@PathVariable long id){return ApiResponse.ok(service.get(id));}
 @PostMapping("/transactions") public Object post(@Valid @RequestBody LedgerService.Command command){return ApiResponse.ok(service.post(command));}
 @PostMapping("/adjustments") public Object adjust(@Valid @RequestBody LedgerService.Adjustment command){return ApiResponse.ok(service.adjust(command));}
 @PostMapping("/transactions/{id}/reverse") public Object reverse(@PathVariable long id,@Valid @RequestBody LedgerService.Reversal command){return ApiResponse.ok(service.reverse(id,command));}
 @GetMapping("/summary") public Object summary(@RequestParam LocalDate from,@RequestParam LocalDate to){return ApiResponse.ok(service.summary(from,to));}
}
